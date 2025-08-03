<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function login(Request $request)
    {
        try {
            Log::info('Login attempt', [
                'email' => $request->email,
                'has_password' => !empty($request->password)
            ]);

            $incomingFields = $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);

            Log::info('Validation passed');

            \DB::connection()->getPdo();
            Log::info('Database connection successful');

            $user = User::where('email', $incomingFields['email'])->first();

            if (!$user) {
                Log::warning('User not found', ['email' => $incomingFields['email']]);
                return response()->json(['success' => false, 'error' => 'Invalid credentials.'], 401);
            }

            Log::info('User found', ['user_id' => $user->id]);

            if (!Hash::check($incomingFields['password'], $user->password)) {
                Log::warning('Password check failed');
                return response()->json(['success' => false, 'error' => 'Invalid credentials.'], 401);
            }

            Log::info('Password verified');

            // Delete old tokens for this user (optional - prevents token accumulation)
            $user->tokens()->delete();

            // Create new token using Sanctum
            $token = $user->createToken('auth-token')->plainTextToken;

            Log::info('Sanctum token generated successfully');

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', ['errors' => $e->errors()]);
            return response()->json(['success' => false, 'error' => 'Validation failed', 'details' => $e->errors()], 422);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Query error',
                'message' => $e->getMessage(),
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings()
            ], 500);
        } catch (\Exception $e) {
            Log::error('Login error', ['message' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]);
            return response()->json(['success' => false, 'error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    public function logout(Request $request) 
    {
        try {
            // Get the authenticated user (Sanctum handles this automatically)
            $user = $request->user();
            
            if ($user) {
                // Revoke the current token
                $request->user()->currentAccessToken()->delete();
                Log::info('User logged out successfully', ['user_id' => $user->id]);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Logout error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Server error occurred.'
            ], 500);
        }
    }

    public function verify(Request $request)
    {
        try {
            // Sanctum automatically handles token verification through middleware
            $user = $request->user();

            if ($user) {
                Log::info('Token verified for user', ['user_id' => $user->id]);
                return response()->json([
                    'success' => true,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                    ]
                ]);
            }

            Log::warning('Invalid token verification attempt');
            return response()->json([
                'success' => false,
                'message' => 'Invalid token'
            ], 401);

        } catch (\Exception $e) {
            Log::error('Token verification error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Server error occurred.'
            ], 500);
        }
    }

    public function current(Request $request)
    {
        try {
            // Sanctum automatically handles token validation through middleware
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Current user error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Server error occurred.'
            ], 500);
        }
    }
}