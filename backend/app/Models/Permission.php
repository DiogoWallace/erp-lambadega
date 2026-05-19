<?php

namespace App\Models;

use App\Models\Concerns\HasUuidV7;
use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    use HasUuidV7;
}
