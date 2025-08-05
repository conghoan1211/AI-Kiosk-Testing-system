import { Card, CardContent } from "@/components/ui/card";
import { containerVariants, itemVariants } from "@/helpers/common";
import { motion } from "framer-motion";

interface StatProps {
  statItems?: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
  }[];
  className?: string;
}

export function UserStats({ statItems, className }: StatProps) {
  //!State

  //!Functions

  //!Render
  return (
    <motion.div
      className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {statItems?.map((item, index) => (
        <motion.div variants={itemVariants} key={index}>
          <Card
            key={item.title}
            className="border-0 shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="flex items-center gap-2 p-4">
              <div className={`rounded-lg ${item.bgColor} p-3`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <h3 className="text-2xl font-bold">{item.value}</h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
