<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class HolidayController extends Controller
{
    /**
     * Get all holidays
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Holiday::query();

            // Filter by year if provided
            if ($request->has('year')) {
                $query->byYear($request->year);
            }

            // Filter by month if provided
            if ($request->has('month')) {
                $query->byMonth($request->month, $request->year);
            }

            // Filter by type if provided
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            // Get upcoming holidays only
            if ($request->has('upcoming') && $request->upcoming == 'true') {
                $query->upcoming($request->limit ?? null);
            } else {
                $query->orderBy('date', 'asc');
            }

            $holidays = $query->get();

            return response()->json([
                'success' => true,
                'data' => $holidays,
                'count' => $holidays->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch holidays',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add a new holiday
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'date' => 'required|date|after_or_equal:today',
                'type' => 'required|string|in:public,religious,national,company,other'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if holiday already exists on this date
            $existingHoliday = Holiday::where('date', $request->date)
                                    ->where('name', $request->name)
                                    ->first();

            if ($existingHoliday) {
                return response()->json([
                    'success' => false,
                    'message' => 'A holiday with this name already exists on this date'
                ], 409);
            }

            $holiday = Holiday::create([
                'name' => $request->name,
                'date' => $request->date,
                'type' => $request->type
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Holiday added successfully',
                'data' => $holiday
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add holiday',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific holiday
     */
    public function show($id): JsonResponse
    {
        try {
            $holiday = Holiday::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $holiday
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Holiday not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update a holiday
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $holiday = Holiday::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'date' => 'sometimes|required|date',
                'type' => 'sometimes|required|string|in:public,religious,national,company,other'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $holiday->update($request->only(['name', 'date', 'type']));

            return response()->json([
                'success' => true,
                'message' => 'Holiday updated successfully',
                'data' => $holiday
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update holiday',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a holiday
     */
    public function destroy($id): JsonResponse
    {
        try {
            $holiday = Holiday::findOrFail($id);
            $holiday->delete();

            return response()->json([
                'success' => true,
                'message' => 'Holiday deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete holiday',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get holidays for current month
     */
    public function currentMonth(): JsonResponse
    {
        try {
            $holidays = Holiday::byMonth(Carbon::now()->month, Carbon::now()->year)
                              ->orderBy('date', 'asc')
                              ->get();

            return response()->json([
                'success' => true,
                'data' => $holidays,
                'month' => Carbon::now()->format('F Y'),
                'count' => $holidays->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch current month holidays',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get upcoming holidays (next 30 days)
     */
    public function upcoming(): JsonResponse
    {
        try {
            $holidays = Holiday::upcoming(10)->get();

            return response()->json([
                'success' => true,
                'data' => $holidays,
                'count' => $holidays->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch upcoming holidays',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}