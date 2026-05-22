<?php

namespace App\DataTransferObjects;

readonly class CreateOrderDTO
{
    /**
     * @param list<OrderItemDTO> $items
     */
    public function __construct(
        public array $items,
        public ?string $customerId = null,
        public string $discountType = 'fixed',
        public float $discountAmount = 0.0,
        public ?string $paymentMethod = null,
        public int $installments = 1,
        public ?string $notes = null,
    ) {}

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            items: array_map(
                static fn (array $item): OrderItemDTO => OrderItemDTO::fromArray($item),
                $data['items'],
            ),
            customerId: $data['customer_id'] ?? null,
            discountType: $data['discount_type'] ?? 'fixed',
            discountAmount: (float) ($data['discount_amount'] ?? 0),
            paymentMethod: $data['payment_method'] ?? null,
            installments: (int) ($data['installments'] ?? 1),
            notes: $data['notes'] ?? null,
        );
    }
}
