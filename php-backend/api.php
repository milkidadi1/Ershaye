<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$storageFile = 'storage.json';

// Initialize storage if not exists
if (!file_exists($storageFile)) {
    $initialData = [
        'schedules' => [
            ["id" => 1, "time" => "06:00 AM", "duration" => "15 min", "days" => "Mon, Wed, Fri", "conditionDry" => true, "conditionTank" => true, "active" => true],
            ["id" => 2, "time" => "05:30 PM", "duration" => "10 min", "days" => "Daily", "conditionDry" => false, "conditionTank" => true, "active" => false]
        ],
        'valve_open' => false,
        'last_updated' => date('Y-m-d H:i:s')
    ];
    file_put_contents($storageFile, json_encode($initialData, JSON_PRETTY_PRINT));
}

$data = json_decode(file_get_contents($storageFile), true);
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'OPTIONS') {
    exit;
}

switch ($action) {
    case 'valve':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            if (isset($input['open'])) {
                $data['valve_open'] = (bool)$input['open'];
                $data['last_updated'] = date('Y-m-d H:i:s');
                file_put_contents($storageFile, json_encode($data, JSON_PRETTY_PRINT));
                echo json_encode(['status' => 'success', 'valve_open' => $data['valve_open']]);
            }
        } else {
            echo json_encode(['valve_open' => $data['valve_open'] ?? false]);
        }
        break;

    case 'schedules':
        if ($method === 'GET') {
            echo json_encode($data['schedules']);
        } elseif ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            if ($input) {
                $found = false;
                foreach ($data['schedules'] as &$s) {
                    if (isset($s['id']) && isset($input['id']) && $s['id'] == $input['id']) {
                        $s = array_merge($s, $input);
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    $input['id'] = time();
                    $data['schedules'][] = $input;
                }
                file_put_contents($storageFile, json_encode($data, JSON_PRETTY_PRINT));
                echo json_encode(['status' => 'success', 'data' => $input]);
            }
        } elseif ($method === 'DELETE') {
            $id = $_GET['id'] ?? null;
            if ($id) {
                $data['schedules'] = array_filter($data['schedules'], function($s) use ($id) {
                    return $s['id'] != $id;
                });
                $data['schedules'] = array_values($data['schedules']);
                file_put_contents($storageFile, json_encode($data, JSON_PRETTY_PRINT));
                echo json_encode(['status' => 'success']);
            }
        }
        break;

    case 'weather':
        $weatherData = [
            'current' => [
                'temp' => 28.5,
                'humidity' => 55,
                'windSpeed' => 12,
                'condition' => 'Clear Sky',
                'icon' => 'sun'
            ],
            'forecast' => [
                ['day' => 'Tomorrow', 'temp' => 29, 'humidity' => 50, 'condition' => 'Sunny'],
                ['day' => 'Sunday', 'temp' => 27, 'humidity' => 65, 'condition' => 'Showers'],
                ['day' => 'Monday', 'temp' => 26, 'humidity' => 60, 'condition' => 'Cloudy'],
                ['day' => 'Tuesday', 'temp' => 30, 'humidity' => 45, 'condition' => 'Hot']
            ],
            'source' => 'Global Weather Service'
        ];
        echo json_encode($weatherData);
        break;

    case 'recommendation':
        $moisture = (int)($_GET['moisture'] ?? 50);
        $temp = (int)($_GET['temp'] ?? 25);
        
        $crops = [
            ['name' => 'Premium Wheat', 'minMoisture' => 45, 'maxMoisture' => 65, 'minTemp' => 15, 'maxTemp' => 24, 'icon' => '🌾'],
            ['name' => 'Basmati Rice', 'minMoisture' => 75, 'maxMoisture' => 100, 'minTemp' => 22, 'maxTemp' => 35, 'icon' => '🍚'],
            ['name' => 'Sweet Maize', 'minMoisture' => 55, 'maxMoisture' => 75, 'minTemp' => 18, 'maxTemp' => 32, 'icon' => '🌽'],
            ['name' => 'Desert Sorghum', 'minMoisture' => 15, 'maxMoisture' => 40, 'minTemp' => 26, 'maxTemp' => 45, 'icon' => '🍂'],
            ['name' => 'Green Beans', 'minMoisture' => 40, 'maxMoisture' => 60, 'minTemp' => 18, 'maxTemp' => 28, 'icon' => '🌱'],
            ['name' => 'Cherry Tomatoes', 'minMoisture' => 60, 'maxMoisture' => 80, 'minTemp' => 20, 'maxTemp' => 30, 'icon' => '🍅']
        ];

        $recommended = [];
        foreach ($crops as $crop) {
            $score = 0;
            if ($moisture >= $crop['minMoisture'] && $moisture <= $crop['maxMoisture']) {
                $score += 60;
            } else {
                $diff = min(abs($moisture - $crop['minMoisture']), abs($moisture - $crop['maxMoisture']));
                $score += max(0, 60 - $diff * 2);
            }

            if ($temp >= $crop['minTemp'] && $temp <= $crop['maxTemp']) {
                $score += 40;
            } else {
                $diff = min(abs($temp - $crop['minTemp']), abs($temp - $crop['maxTemp']));
                $score += max(0, 40 - $diff * 3);
            }
            $crop['score'] = $score;
            $recommended[] = $crop;
        }

        usort($recommended, function($a, $b) { return $b['score'] - $a['score']; });

        echo json_encode([
            'recommendations' => $recommended,
            'analysis' => ['status' => 'optimized']
        ]);
        break;

    default:
        echo json_encode(['status' => 'online', 'version' => '1.1']);
        break;
}
