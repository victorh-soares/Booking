import { prisma } from "@/lib/prisma";
import BarbershopItem from "@/app/_components/barbershop-item";
import Header from "@/app/_components/header";
import QuickSearchButtons from "@/app/_components/quick-search-buttons";
import SearchInput from "@/app/_components/search-input";
import { PageContainer } from "@/app/_components/ui/page";

interface BarbershopsPageProps {
  params?: Promise<Record<string, never>>;
  searchParams: Promise<{
    search?: string;
  }>;
}

const BarbershopsPage = async ({ searchParams }: BarbershopsPageProps) => {
  const { search } = await searchParams;
  const barbershops = search
    ? await prisma.barbershop.findMany({
        where: {
          services: {
            some: {
              name: {
                contains: search as string,
                mode: "insensitive",
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      })
    : [];

  return (
    <main>
      <Header />
      <PageContainer>
        <SearchInput />

        <QuickSearchButtons />

        {search && (
          <div className="mt-6">
            <h2 className="text-muted-foreground mb-4 text-sm font-semibold uppercase">
              Resultados para &quot;{search}&quot;
            </h2>

            {barbershops.length > 0 ? (
              <div className="flex flex-col gap-4">
                {barbershops.map((barbershop) => (
                  <BarbershopItem key={barbershop.id} barbershop={barbershop} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center">
                Nenhum serviço encontrado.
              </p>
            )}
          </div>
        )}
      </PageContainer>
    </main>
  );
};

export default BarbershopsPage;
