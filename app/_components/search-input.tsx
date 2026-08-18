"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { SearchIcon } from "lucide-react";

const SearchInput = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/barbershops?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Pesquise serviços ou profissionais"
        className="border-border rounded-full"
      />
      <Button type="submit" variant="default" size="icon" className="rounded-full">
        <SearchIcon />
      </Button>
    </form>
  );
};

export default SearchInput;
