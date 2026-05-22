<?php

namespace App\DataTransferObjects;

readonly class OrderItemDTO
{
    public function __construct(
        public string $productId,
        public int $quantity,
        public ?float $unitPrice = null,
        public float $discountAmount = 0.0,
        public ?string $notes = null,
    ) {}

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            productId: $data['product_id'],
            quantity: (int) $data['quantity'],
            unitPrice: isset($data['unit_price']) && $data['unit_price'] !== null
                ? (float) $data['unit_price']
                : null,
            discountAmount: (float) ($data['discount_amount'] ?? 0),
            notes: $data['notes'] ?? null,
        );
    }
}
