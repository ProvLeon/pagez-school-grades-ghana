import { useState } from "react";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateGeneratorSection } from "@/components/sheets/TemplateGeneratorSection";
import { BulkOperationsSection } from "@/components/sheets/BulkOperationsSection";
import { ReportsExportSection } from "@/components/sheets/ReportsExportSection";
import { SheetOperationsHistory } from "@/components/sheets/SheetOperationsHistory";
import { SheetsStatsCards } from "@/components/sheets/SheetsStatsCards";
import { FileSpreadsheet, Upload, Download, History } from "lucide-react";

const ManageSheets = () => {
    const [activeTab, setActiveTab] = useState("templates");

    return (
        <div className="min-h-screen bg-background">
            <Header 
                title="Sheet Management"
                subtitle="Generate templates, perform bulk operations, and export reports"
            />

            <main className="container mx-auto px-4 py-6 space-y-6">
                <SheetsStatsCards />

                <Tabs defaultValue="templates" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                        <TabsTrigger value="templates"><FileSpreadsheet className="w-4 h-4 mr-2" />Templates</TabsTrigger>
                        <TabsTrigger value="bulk-ops"><Upload className="w-4 h-4 mr-2" />Bulk Operations</TabsTrigger>
                        <TabsTrigger value="reports"><Download className="w-4 h-4 mr-2" />Reports & Exports</TabsTrigger>
                        <TabsTrigger value="history"><History className="w-4 h-4 mr-2" />History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="templates" className="mt-6">
                        <TemplateGeneratorSection />
                    </TabsContent>
                    <TabsContent value="bulk-ops" className="mt-6">
                        <BulkOperationsSection />
                    </TabsContent>
                    <TabsContent value="reports" className="mt-6">
                        <ReportsExportSection />
                    </TabsContent>
                    <TabsContent value="history" className="mt-6">
                        <SheetOperationsHistory />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default ManageSheets;