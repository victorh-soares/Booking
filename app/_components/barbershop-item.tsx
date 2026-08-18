"use client";

import { Barbershop } from "@/app/generated/prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface BarbershopItemProps {
  barbershop: Barbershop;
}

const DEFAULT_IMAGE = "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png";

const BarbershopItem = ({ barbershop }: BarbershopItemProps) => {
  const [imageSrc, setImageSrc] = useState(
    barbershop.imageUrl || DEFAULT_IMAGE
  );

  return (
    <Link
      href={`/barbershops/${barbershop.id}`}
      className="relative block min-h-[200px] min-w-[290px] overflow-hidden rounded-xl"
    >
      <div className="absolute top-0 left-0 z-10 h-full w-full rounded-lg bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <Image
        src={imageSrc}
        alt={barbershop.name || "Barbearia"}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="rounded-xl object-cover"
        onError={() => setImageSrc(DEFAULT_IMAGE)}
      />
      <div className="absolute right-0 bottom-0 left-0 z-20 p-4">
        <h3 className="text-background text-lg font-bold">{barbershop.name}</h3>
        <p className="text-background text-xs">{barbershop.address}</p>
      </div>
    </Link>
  );
};

export default BarbershopItem;
