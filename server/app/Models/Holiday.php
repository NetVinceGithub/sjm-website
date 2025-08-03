<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Holiday extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'date',
        'type',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    // Scope to get holidays by year
    public function scopeByYear($query, $year)
    {
        return $query->whereYear('date', $year);
    }

    // Scope to get holidays by month
    public function scopeByMonth($query, $month, $year = null)
    {
        $query = $query->whereMonth('date', $month);
        
        if ($year) {
            $query->whereYear('date', $year);
        }
        
        return $query;
    }

    // Scope to get upcoming holidays
    public function scopeUpcoming($query, $limit = null)
    {
        $query = $query->where('date', '>=', Carbon::today())->orderBy('date', 'asc');
        
        if ($limit) {
            $query->limit($limit);
        }
        
        return $query;
    }

    // Accessor to format date for display
    public function getFormattedDateAttribute()
    {
        return $this->date->format('F j, Y');
    }

    // Check if holiday is today
    public function getIsTodayAttribute()
    {
        return $this->date->isToday();
    }

    // Check if holiday is upcoming (within next 30 days)
    public function getIsUpcomingAttribute()
    {
        return $this->date->isFuture() && $this->date->diffInDays(Carbon::today()) <= 30;
    }
}