interface ExamHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

const ExamHeader = ({ title, subtitle, icon, className }: ExamHeaderProps) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">{icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="text-blue-100">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamHeader;
