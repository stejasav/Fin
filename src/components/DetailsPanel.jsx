import { useState } from "react";
import {
  Users,
  BarChart3,
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Building,
  Globe,
  Briefcase,
  CreditCard,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

const sections = [
  {
    title: "LINKS",
    items: [
      {
        name: "Tracker ticket",
        icon: <BarChart3 className="w-4 h-4 text-black" />,
        value: "#TRK-2024-1158",
      },
      {
        name: "Back-office tickets",
        icon: <Shield className="w-4 h-4 text-black" />,
        value: "3 tickets",
      },
      {
        name: "Side conversations",
        icon: <ExternalLink className="w-4 h-4 text-black" />,
        value: "2 active",
      },
    ],
  },
  {
    title: "USER DATA",
    items: [
      {
        name: "Email",
        icon: <Mail className="w-4 h-4 text-black" />,
        value: "luis.fonsi@gmail.com",
      },
      {
        name: "Phone",
        icon: <Phone className="w-4 h-4 text-black" />,
        value: "+1 (555) 123-4567",
      },
      {
        name: "Location",
        icon: <MapPin className="w-4 h-4 text-black" />,
        value: "San Francisco, CA",
      },
      {
        name: "Member since",
        icon: <Calendar className="w-4 h-4 text-black" />,
        value: "Nov 15, 2023",
      },
      {
        name: "Lifetime value",
        icon: <DollarSign className="w-4 h-4 text-black" />,
        value: "$2,847.50",
      },
      {
        name: "Total orders",
        icon: <Package className="w-4 h-4 text-black" />,
        value: "12 orders",
      },
    ],
  },
  {
    title: "CONVERSATION ATTRIBUTES",
    items: [
      {
        name: "Priority",
        icon: <AlertCircle className="w-4 h-4 text-black" />,
        value: "High",
        valueClass: "text-orange-600 font-medium",
      },
      {
        name: "Category",
        icon: <Tag className="w-4 h-4 text-black" />,
        value: "Refund Request",
      },
      {
        name: "Status",
        icon: <CheckCircle className="w-4 h-4 text-black" />,
        value: "In Progress",
        valueClass: "text-blue-600",
      },
      {
        name: "Response time",
        icon: <Clock className="w-4 h-4 text-black" />,
        value: "2m 15s",
      },
      {
        name: "Language",
        icon: <Globe className="w-4 h-4 text-black" />,
        value: "English (US)",
      },
    ],
  },
  {
    title: "COMPANY DETAILS",
    items: [
      {
        name: "Company",
        icon: <Building className="w-4 h-4 text-black" />,
        value: "GitHub Inc.",
      },
      {
        name: "Industry",
        icon: <Briefcase className="w-4 h-4 text-black" />,
        value: "Software Development",
      },
      {
        name: "Size",
        icon: <Users className="w-4 h-4 text-black" />,
        value: "1,000-5,000 employees",
      },
      {
        name: "Plan",
        icon: <CreditCard className="w-4 h-4 text-black" />,
        value: "Enterprise",
        valueClass: "text-purple-600 font-medium",
      },
    ],
  },
  {
    title: "SALESFORCE",
    items: [
      {
        name: "Contact ID",
        icon: <FileText className="w-4 h-4 text-black" />,
        value: "003XX000004TMM2",
      },
      {
        name: "Account",
        icon: <Building className="w-4 h-4 text-black" />,
        value: "GitHub Enterprise",
      },
      {
        name: "Opportunity",
        icon: <DollarSign className="w-4 h-4 text-black" />,
        value: "$125,000 (Q4 2024)",
      },
      {
        name: "Last activity",
        icon: <Calendar className="w-4 h-4 text-black" />,
        value: "3 days ago",
      },
    ],
  },
  {
    title: "STRIPE",
    items: [
      {
        name: "Customer ID",
        icon: <CreditCard className="w-4 h-4 text-black" />,
        value: "cus_PEuGhN8XvQBm3p",
      },
      {
        name: "Payment method",
        icon: <CreditCard className="w-4 h-4 text-black" />,
        value: "•••• 4242",
      },
      {
        name: "Subscription",
        icon: <Package className="w-4 h-4 text-black" />,
        value: "Active - Monthly",
        valueClass: "text-green-600",
      },
      {
        name: "Next invoice",
        icon: <Calendar className="w-4 h-4 text-black" />,
        value: "Dec 15, 2024 ($149)",
      },
    ],
  },
  {
    title: "JIRA FOR TICKETS",
    items: [
      {
        name: "Project",
        icon: <FileText className="w-4 h-4 text-black" />,
        value: "SUPPORT",
      },
      {
        name: "Issue type",
        icon: <Tag className="w-4 h-4 text-black" />,
        value: "Bug",
      },
      {
        name: "Reporter",
        icon: <Users className="w-4 h-4 text-black" />,
        value: "luis.fonsi@gmail.com",
      },
      {
        name: "Linked issues",
        icon: <ExternalLink className="w-4 h-4 text-black" />,
        value: "SUP-1234, SUP-1235",
      },
    ],
  },
];

const DetailsPanel = () => {
  const [expanded, setExpanded] = useState({
    LINKS: true,
    "USER DATA": true,
    "CONVERSATION ATTRIBUTES": true,
    "COMPANY DETAILS": false,
    SALESFORCE: false,
    STRIPE: false,
    "JIRA FOR TICKETS": false,
  });

  // Get active chat from parent component (you can pass this as a prop)
  // const activeChat = "Luis · Github";
  // const [firstName] = activeChat.split(" · ");

  return (
    <div className="h-full bg-white text-sm text-black overflow-y-auto">
      <div className="p-4 divide-y divide-gray-200">
        {/* Assignee */}
        <div className="pb-3 flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500">Assignee</span>
          <div className="flex items-center gap-2">
            <img
              src="https://i.pravatar.cc/24?img=12"
              alt="Avatar"
              className="rounded-full w-5 h-5"
            />
            <span className="font-medium">Brian Byrne</span>
          </div>
        </div>

        {/* Team */}
        <div className="py-3 flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500">Team</span>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-black" />
            <span className="font-medium">Unavailable</span>
          </div>
        </div>

        {/* Sections */}
        <div className="pt-3 divide-y divide-gray-200">
          {sections.map(({ title, items }) => (
            <div key={title} className="py-3">
              <button
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, [title]: !prev[title] }))
                }
                className="flex items-center justify-between w-full text-left font-semibold text-sm"
              >
                <span>{title}</span>
                {expanded[title] ? (
                  <ChevronUp className="w-4 h-4 text-black" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-black" />
                )}
              </button>

              {expanded[title] && items.length > 0 && (
                <div className="space-y-3 mt-3">
                  {items.map(({ name, icon, value, valueClass }) => (
                    <div
                      key={name}
                      className="flex items-center justify-between text-sm text-black"
                    >
                      <div className="flex items-center gap-3">
                        {icon}
                        <span>{name}</span>
                      </div>
                      {value ? (
                        <span
                          className={`text-gray-600 text-xs ${
                            valueClass || ""
                          }`}
                        >
                          {value}
                        </span>
                      ) : (
                        <button className="w-6 h-6 rounded-full border border-gray-400 bg-white hover:bg-gray-100 text-black font-bold flex items-center justify-center shadow-sm">
                          +
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {expanded[title] && items.length === 0 && (
                <div className="mt-3 text-gray-400 text-xs text-center py-2">
                  No data available
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailsPanel;
