<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HolidayController;

// Public auth routes (no middleware needed)
Route::post('/auth/login', [UserController::class, 'login']);
Route::post('/auth/register', [UserController::class, 'register']);

// Protected auth routes (using Sanctum middleware)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [UserController::class, 'logout']);
    Route::get('/auth/verify', [UserController::class, 'verify']);
    Route::get('/users/current', [UserController::class, 'current']);
    
    // Holiday routes
    Route::prefix('holidays')->group(function () {
        Route::get('/', [HolidayController::class, 'index']);              // GET /api/holidays
        Route::post('/add', [HolidayController::class, 'store']);          // POST /api/holidays/add (matches your frontend)
        Route::get('/current-month', [HolidayController::class, 'currentMonth']); // GET /api/holidays/current-month
        Route::get('/upcoming', [HolidayController::class, 'upcoming']);   // GET /api/holidays/upcoming
        Route::get('/{id}', [HolidayController::class, 'show']);           // GET /api/holidays/{id}
        Route::put('/{id}', [HolidayController::class, 'update']);         // PUT /api/holidays/{id}
        Route::delete('/{id}', [HolidayController::class, 'destroy']);     // DELETE /api/holidays/{id}
    });
});

// Test route (keep for debugging)
Route::get('/test-db', function () {
    try {
        \DB::connection()->getPdo();
        
        // Check if users table exists
        $tables = \DB::select('SHOW TABLES');
        $userTableExists = false;
        foreach ($tables as $table) {
            $tableArray = (array) $table;
            if (in_array('users', $tableArray)) {
                $userTableExists = true;
                break;
            }
        }
        
        // Get users table structure if it exists
        $tableStructure = null;
        if ($userTableExists) {
            $tableStructure = \DB::select('DESCRIBE users');
        }
        
        // Check if personal_access_tokens table exists (Sanctum)
        $sanctumTableExists = false;
        foreach ($tables as $table) {
            $tableArray = (array) $table;
            if (in_array('personal_access_tokens', $tableArray)) {
                $sanctumTableExists = true;
                break;
            }
        }
        
        return response()->json([
            'database_connected' => true,
            'users_table_exists' => $userTableExists,
            'sanctum_table_exists' => $sanctumTableExists,
            'table_structure' => $tableStructure,
            'tables_count' => count($tables)
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'database_connected' => false,
            'error' => $e->getMessage()
        ]);
    }
});