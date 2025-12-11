
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { MoreHorizontal, Edit, Trash2, Building2 } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";

import { useDeleteDepartment } from "@/hooks/useDepartments";

import { useState } from "react";



interface DepartmentsTableProps {

  departments: any[];

  onEdit: (department: any) => void;

  onAdd: () => void;

}



export function DepartmentsTable({ departments, onEdit, onAdd }: DepartmentsTableProps) {

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; department: any; }>({ isOpen: false, department: null });

  const deleteDepartment = useDeleteDepartment();



  const handleDeleteClick = (department: any) => {

    setDeleteConfirmation({ isOpen: true, department });

  };



  const handleDeleteConfirm = () => {

    if (deleteConfirmation.department) {

      deleteDepartment.mutate(deleteConfirmation.department.id, {

        onSuccess: () => {

          setDeleteConfirmation({ isOpen: false, department: null });

        },

      });

    }

  };



  if (departments.length === 0) {

    return (

      <div className="text-center py-20">

        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />

        <h3 className="mt-4 text-lg font-semibold">No departments found</h3>

        <p className="mt-2 text-sm text-muted-foreground">Get started by adding a new department.</p>

        <Button className="mt-6" onClick={onAdd}>

          Add Department

        </Button>

      </div>

    );

  }



  return (

    <>

      <div className="border rounded-lg overflow-hidden">

        <Table>

          <TableHeader>

            <TableRow className="bg-muted/40 hover:bg-muted/40">

              <TableHead>Department</TableHead>

              <TableHead className="hidden md:table-cell">Description</TableHead>

              <TableHead className="hidden lg:table-cell">Created</TableHead>

              <TableHead className="text-right">Actions</TableHead>

            </TableRow>

          </TableHeader>

          <TableBody>

            {departments.map((department) => (

              <TableRow key={department.id}>

                <TableCell className="font-medium">{department.name}</TableCell>

                <TableCell className="hidden md:table-cell text-muted-foreground">{department.description || "-"}</TableCell>

                <TableCell className="hidden lg:table-cell text-muted-foreground">

                  {new Date(department.created_at).toLocaleDateString()}

                </TableCell>

                <TableCell className="text-right">

                  <DropdownMenu>

                    <DropdownMenuTrigger asChild>

                      <Button variant="ghost" size="icon">

                        <MoreHorizontal className="w-4 h-4" />

                      </Button>

                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">

                      <DropdownMenuItem onClick={() => onEdit(department)}>

                        <Edit className="w-4 h-4 mr-2" />

                        Edit

                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => handleDeleteClick(department)} className="text-destructive">

                        <Trash2 className="w-4 h-4 mr-2" />

                        Delete

                      </DropdownMenuItem>

                    </DropdownMenuContent>

                  </DropdownMenu>

                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </div>



      <DeleteConfirmationDialog

        isOpen={deleteConfirmation.isOpen}

        onOpenChange={(open) => setDeleteConfirmation({ isOpen: open, department: null })}

        onConfirm={handleDeleteConfirm}

        title="Delete Department"

        description={`Are you sure you want to delete the "${deleteConfirmation.department?.name}" department?`}

        isLoading={deleteDepartment.isPending}

      />

    </>

  );

}


