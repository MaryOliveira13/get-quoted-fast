import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BrandsTab from "@/components/admin/gestao/BrandsTab";
import DevicesTab from "@/components/admin/gestao/DevicesTab";
import ServicesTab from "@/components/admin/gestao/ServicesTab";
import PricesTab from "@/components/admin/gestao/PricesTab";
import ClientsTab from "@/components/admin/gestao/ClientsTab";

export default function AdminGestao() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      <header>
        <h1 className="text-2xl font-extrabold uppercase tracking-[0.5px] text-foreground font-[Montserrat]">
          Gestão do Site
        </h1>
        <p className="text-sm text-muted-foreground">
          Marcas, aparelhos, serviços, preços e clientes — dados reais do banco.
        </p>
      </header>

      <Tabs defaultValue="marcas">
        <TabsList className="flex w-full overflow-x-auto justify-start">
          <TabsTrigger value="marcas">Marcas</TabsTrigger>
          <TabsTrigger value="aparelhos">Aparelhos</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="precos">Preços</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>
        <TabsContent value="marcas" className="mt-5"><BrandsTab /></TabsContent>
        <TabsContent value="aparelhos" className="mt-5"><DevicesTab /></TabsContent>
        <TabsContent value="servicos" className="mt-5"><ServicesTab /></TabsContent>
        <TabsContent value="precos" className="mt-5"><PricesTab /></TabsContent>
        <TabsContent value="clientes" className="mt-5"><ClientsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
