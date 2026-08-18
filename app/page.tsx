import Header from "./_components/header";
import SearchInput from "./_components/search-input";
import BookingItem from "./_components/booking-item";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import BarbershopItem from "./_components/barbershop-item";
// import Footer from "./_components/footer";
import {
  PageContainer,
  PageSection,
  PageSectionScroller,
  PageSectionTitle,
} from "./_components/ui/page";
import QuickSearchButtons from "./_components/quick-search-buttons";

const Home = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const now = new Date();
  let bookingToDisplay = null;

  if (session?.user?.id) {
    const userBookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        service: true,
        barbershop: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const confirmedBookings = userBookings.filter(
      (b) => !b.cancelled && new Date(b.date) >= now,
    );

    if (confirmedBookings.length > 0) {
      bookingToDisplay = confirmedBookings[0];
    } else if (userBookings.length > 0) {
      const pastBookings = [...userBookings].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      bookingToDisplay = pastBookings[0];
    }
  }

  const recommendedBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const popularBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: "desc",
    },
  });

  return (
    <main>
      <Header />
      <PageContainer>
        <SearchInput />

        <QuickSearchButtons />

        {bookingToDisplay && (
          <PageSection>
            <PageSectionTitle>Agendamentos</PageSectionTitle>
            <BookingItem booking={bookingToDisplay} />
          </PageSection>
        )}

        <PageSection>
          <PageSectionTitle>Recomendados</PageSectionTitle>
          <PageSectionScroller>
            {recommendedBarbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageSectionScroller>

          <PageSectionTitle>Populares</PageSectionTitle>
          <PageSectionScroller>
            {popularBarbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageSectionScroller>
        </PageSection>
      </PageContainer>
      {/* <Footer /> */}
    </main>
  );
};

export default Home;
