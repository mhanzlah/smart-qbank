import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PendingQuestions = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Question</TableHead>
        <TableHead>Topic</TableHead>
        <TableHead>Difficulty</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-64" />
          </TableCell>

          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>

          <TableCell>
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>

          <TableCell>
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>

          <TableCell>
            <div className="flex justify-end">
              <Skeleton className="size-8 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default PendingQuestions;
