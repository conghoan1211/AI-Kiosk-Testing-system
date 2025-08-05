import { useTranslation } from "react-i18next";

interface StatsProps {
  stats: {
    questionBanks: number;
    totalQuestions: number;
    subjects: number;
  };
}

export default function QuestionBankStats({ stats }: StatsProps) {
  const { t } = useTranslation("shared");

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
      <StatCard
        value={stats.questionBanks}
        label={t("BankQuestion.BankQuestion")}
        color="text-blue-500"
      />
      <StatCard
        value={stats.totalQuestions}
        label={t("BankQuestion.TotalQuestions")}
        color="text-green-500"
      />
      <StatCard
        value={stats.subjects}
        label={t("BankQuestion.NameSubject")}
        color="text-orange-500"
      />
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  color: string;
}

function StatCard({ value, label, color }: StatCardProps) {
  return (
    <div
      className="rounded-lg border p-4 text-center"
      style={{ backgroundColor: "white" }}
    >
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
