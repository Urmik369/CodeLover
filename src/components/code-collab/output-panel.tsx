type OutputPanelProps = {
  output: string;
};

export default function OutputPanel({ output }: OutputPanelProps) {
  return (
    <div className="w-full h-full bg-card rounded-lg">
      <pre className="p-4 font-code text-sm text-foreground whitespace-pre-wrap">
        {output}
      </pre>
    </div>
  );
}
