import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GitCommit, RotateCcw } from "lucide-react";

const mockHistory = [
    {
      id: "commit-1",
      message: "Initial commit",
      author: "Alex",
      timestamp: "10 minutes ago",
    },
    {
      id: "commit-2",
      message: "Add greeting function",
      author: "Sam",
      timestamp: "8 minutes ago",
    },
    {
      id: "commit-3",
      message: "Refactor variable names",
      author: "Alex",
      timestamp: "5 minutes ago",
    },
    {
      id: "commit-4",
      message: "Fix console log message",
      author: "Jordan",
      timestamp: "2 minutes ago",
    },
];

export default function VersionHistory() {
  return (
    <div className="space-y-4">
        {mockHistory.map((commit, index) => (
            <Card key={commit.id} className="bg-card/50">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-start gap-4">
                        <div className="pt-1">
                            <GitCommit className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold">{commit.message}</p>
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium">{commit.author}</span> committed {commit.timestamp}
                            </p>
                        </div>
                    </div>
                    {index > 0 && (
                        <Button variant="ghost" size="sm">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Revert
                        </Button>
                    )}
                </CardContent>
            </Card>
        ))}
    </div>
  );
}
