
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import { AddSubjectDialog } from "@/components/AddSubjectDialog";

interface SubjectsHeaderProps {
  totalSubjects: number;
  filteredCount: number;
  onWatchGuide: () => void;
}

export function SubjectsHeader({ totalSubjects, filteredCount, onWatchGuide }: SubjectsHeaderProps) {
  return (
    <Card className="shadow-2xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden rounded-2xl">
      <CardContent className="p-6 sm:p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Subject Management Hub
                </h1>
              </div>
              <p className="text-blue-200 text-sm lg:text-base max-w-2xl">
                Create, organize, and manage subjects across all departments with ease
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <AddSubjectDialog 
                trigger={
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-6 py-3 shadow-xl transition-all duration-300 w-full sm:w-auto font-semibold hover:scale-105 rounded-xl border-0">
                    <Plus className="w-5 h-5 mr-2 text-blue-600" />
                    ADD NEW SUBJECT
                  </Button>
                }
              />
              <Button 
                variant="outline" 
                className="border-white/30 text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700 px-6 py-3 w-full sm:w-auto backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105"
                onClick={onWatchGuide}
              >
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Help & Tips
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
