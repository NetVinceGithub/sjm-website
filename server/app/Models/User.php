<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'profileImage',
        'resetToken',
        'resetCode',
        'isBlocked',
        // Removed 'api_token' and 'user_token' - Sanctum handles tokens
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'resetToken',
        'resetCode',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'createdAt' => 'datetime',
            'updatedAt' => 'datetime',
            'password' => 'hashed',
            'isBlocked' => 'boolean',
        ];
    }

    /**
     * The name of the "created at" column.
     *
     * @var string|null
     */
    const CREATED_AT = 'createdAt';

    /**
     * The name of the "updated at" column.
     *
     * @var string|null
     */
    const UPDATED_AT = 'updatedAt';

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is approver
     */
    public function isApprover(): bool
    {
        return $this->hasRole('approver');
    }

    /**
     * Check if user is HR
     */
    public function isHR(): bool
    {
        return $this->hasRole('hr');
    }

    /**
     * Check if user is blocked
     */
    public function isBlocked(): bool
    {
        return (bool) $this->isBlocked;
    }

    /**
     * Block the user
     */
    public function block(): void
    {
        $this->update(['isBlocked' => true]);
    }

    /**
     * Unblock the user
     */
    public function unblock(): void
    {
        $this->update(['isBlocked' => false]);
    }

    /**
     * Generate a password reset token
     */
    public function generateResetToken(): string
    {
        $this->resetToken = hash('sha256', time() . $this->email . random_bytes(16));
        $this->save();
        
        return $this->resetToken;
    }

    /**
     * Generate a password reset code
     */
    public function generateResetCode(): string
    {
        $this->resetCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->save();
        
        return $this->resetCode;
    }

    /**
     * Clear reset credentials
     */
    public function clearResetCredentials(): void
    {
        $this->update([
            'resetToken' => null,
            'resetCode' => null
        ]);
    }

    /**
     * Scope to get users by role
     */
    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope to get non-blocked users
     */
    public function scopeActive($query)
    {
        return $query->where('isBlocked', false);
    }

    /**
     * Scope to get blocked users
     */
    public function scopeBlocked($query)
    {
        return $query->where('isBlocked', true);
    }
}