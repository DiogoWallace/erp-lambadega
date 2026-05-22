<?php

namespace App\DataTransferObjects;

readonly class PayOrderDTO
{
    public function __construct(
        public string $paymentMethod,
        public int $installments = 1,
    ) {}

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            paymentMethod: $data['payment_method'],
            installments: (int) ($data['installments'] ?? 1),
        );
    }
}
