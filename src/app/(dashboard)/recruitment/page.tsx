"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Briefcase,
  MessageSquare,
  Calendar,
  UserCheck,
  UserX,
  FileText,
  Sparkles,
  ShieldCheck,
  ArrowUpDown,
} from "lucide-react";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";

export interface Candidate {
  id: string;
  name: string;
  role: string;
  jobId: string;
  score: number;
  exp: string;
  status: "Recommended" | "In Review" | "Rejected by AI" | "Hired" | "Interview Scheduled";
  phone: string;
  certifications: string[];
  scoreBreakdown: {
    technical: number;
    customerService: number;
    reliability: number;
    speed: number;
  };
  aiInsights: {
    technicalValidation: string;
    customerService: string;
    recommendation: string;
    strengths: string[];
    redFlags?: string;
  };
  transcript: Array<{
    id: string;
    sender: "bot" | "candidate";
    senderName: string;
    text: string;
    time: string;
  }>;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  candidateCount: number;
  targetScore: number;
  status: "Active" | "Draft" | "Filled";
}

const INITIAL_JOBS: JobOpening[] = [
  { id: "job-1", title: "Senior HVAC Technician", department: "Commercial Service", candidateCount: 6, targetScore: 85, status: "Active" },
  { id: "job-2", title: "Residential AC Specialist", department: "Residential Service", candidateCount: 4, targetScore: 80, status: "Active" },
  { id: "job-3", title: "Commercial Refrigeration Tech", department: "Industrial", candidateCount: 3, targetScore: 90, status: "Active" },
];

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "cand-1",
    name: "Michael T.",
    role: "Commercial AC Repair",
    jobId: "job-1",
    score: 94,
    exp: "8 Years",
    status: "Recommended",
    phone: "+1 (555) 234-8901",
    certifications: ["EPA Universal (Type I, II, III)", "NATE Heat Pump Specialist", "OSHA 30"],
    scoreBreakdown: {
      technical: 96,
      customerService: 92,
      reliability: 95,
      speed: 93,
    },
    aiInsights: {
      technicalValidation: "Successfully resolved diagnostic question regarding frozen evaporator coil — pinpointed restricted airflow and TXV sensing bulb failure as primary vectors.",
      customerService: "Demonstrated exemplary de-escalation roleplaying an agitated commercial restaurant manager during a 95°F heatwave outage.",
      recommendation: "High-priority hire. Technical competency matches Tier-3 Master Technician. Fast-track to human manager offer.",
      strengths: ["Subcooling/Superheat calculation", "Clean driving record", "EPA Universal certified", "Commercial chiller expertise"],
    },
    transcript: [
      {
        id: "t1",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Hi Michael! Thanks for applying for the Senior HVAC Technician role at Apex Cooling. I am Alex, Apex's autonomous screening agent. Ready for a 4-minute technical evaluation?",
        time: "10:02 AM",
      },
      {
        id: "t2",
        sender: "candidate",
        senderName: "Michael T.",
        text: "Hey Alex! Yes, ready whenever you are.",
        time: "10:03 AM",
      },
      {
        id: "t3",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Question 1: You arrive at a 20-ton commercial rooftop unit. The evaporator coil is heavily iced up, condenser fan runs, but suction pressure is abnormally low. Walk me through your diagnostic sequence.",
        time: "10:03 AM",
      },
      {
        id: "t4",
        sender: "candidate",
        senderName: "Michael T.",
        text: "First, I verify airflow: inspect pleated filters, belt tension, and supply damper actuators. If airflow is good, I thaw the coil completely without high-pressure torches, verify superheat and subcooling. Low suction with high superheat points to an underfeeding TXV or filter-drier restriction. Low suction with low superheat indicates severe airflow loss or blower failure.",
        time: "10:05 AM",
      },
      {
        id: "t5",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Superb diagnostic clarity. Question 2: A restaurant general manager is frantic because their walk-in freezer is down during Friday dinner rush. How do you communicate with them upon arrival?",
        time: "10:06 AM",
      },
      {
        id: "t6",
        sender: "candidate",
        senderName: "Michael T.",
        text: "I greet them calmly: 'I understand how stressful this is during your peak rush. I am on site now and my sole focus is getting your system running safely. Let me run my diagnostics and I will give you a clear update in 15 minutes.' Then I keep my word and provide constant updates.",
        time: "10:07 AM",
      },
      {
        id: "t7",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Excellent empathy. Do you possess active EPA Universal certification and what is your on-call availability?",
        time: "10:08 AM",
      },
      {
        id: "t8",
        sender: "candidate",
        senderName: "Michael T.",
        text: "Yes, EPA Universal #EPA-994812, valid through 2029. Fully available for rotating 24/7 on-call 1 week per month.",
        time: "10:09 AM",
      },
      {
        id: "t9",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Candidate qualified! Overall Score: 94/100. We have notified the hiring manager for final interview scheduling.",
        time: "10:09 AM",
      },
    ],
  },
  {
    id: "cand-2",
    name: "Sarah L.",
    role: "Residential Installation",
    jobId: "job-1",
    score: 88,
    exp: "5 Years",
    status: "Recommended",
    phone: "+1 (555) 345-6789",
    certifications: ["EPA Type II", "Carrier Factory Certified Installer", "NATE Core"],
    scoreBreakdown: {
      technical: 86,
      customerService: 94,
      reliability: 90,
      speed: 82,
    },
    aiInsights: {
      technicalValidation: "Accurately calculated duct static pressure drop and verified SEER2 installation tolerances on dual-stage inverter split systems.",
      customerService: "Exceptional clarity explaining ductless mini-split efficiency to non-technical residential homeowners.",
      recommendation: "Recommended for residential team. High customer satisfaction probability and spotless customer feedback.",
      strengths: ["Ductwork fabrication", "Inverter system commissioning", "Strong customer rapport"],
    },
    transcript: [
      {
        id: "s1",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Hello Sarah! Thanks for your application for the HVAC Installation Specialist role. Ready to begin your WhatsApp screening?",
        time: "11:15 AM",
      },
      {
        id: "s2",
        sender: "candidate",
        senderName: "Sarah L.",
        text: "Hi Alex! Yes, ready to go.",
        time: "11:16 AM",
      },
      {
        id: "s3",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "When commissioning a new 4-ton variable speed split system, what total external static pressure (TESP) threshold do you test for before leaving?",
        time: "11:16 AM",
      },
      {
        id: "s4",
        sender: "candidate",
        senderName: "Sarah L.",
        text: "I verify TESP stays under 0.5 in. w.g. using a dual-port digital manometer across the return and supply plenums. If it's over 0.7, I inspect transition dampers and filter size to protect the ECM motor.",
        time: "11:18 AM",
      },
      {
        id: "s5",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Correct. How do you explain smart Wi-Fi thermostat scheduling to an elderly homeowner who feels intimidated by mobile apps?",
        time: "11:19 AM",
      },
      {
        id: "s6",
        sender: "candidate",
        senderName: "Sarah L.",
        text: "I set their desired comfort schedule directly on the wall unit together, write a 1-page large-print quick guide, and have them try adjusting it twice while I watch to ensure they feel 100% confident.",
        time: "11:21 AM",
      },
      {
        id: "s7",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Thank you Sarah! Outstanding customer-first mindset. AI Score: 88/100. Recommended for hiring panel.",
        time: "11:22 AM",
      },
    ],
  },
  {
    id: "cand-3",
    name: "Elena R.",
    role: "Commercial Refrigeration",
    jobId: "job-3",
    score: 96,
    exp: "7 Years",
    status: "Recommended",
    phone: "+1 (555) 456-7890",
    certifications: ["EPA Universal", "RETA Ammonia Level 1", "Low-GWP CO2 Certified"],
    scoreBreakdown: {
      technical: 98,
      customerService: 94,
      reliability: 97,
      speed: 95,
    },
    aiInsights: {
      technicalValidation: "Mastery of cascade CO2/R-290 systems, supermarket multiplex rack controllers, and electronic expansion valves.",
      customerService: "Exceedingly professional incident logs and transparent root-cause failure reporting for facilities managers.",
      recommendation: "Top-tier candidate for industrial and supermarket division. Immediate offer recommended.",
      strengths: ["Supermarket rack systems", "Cascade CO2 refrigeration", "Microchannel condenser repair"],
    },
    transcript: [
      {
        id: "e1",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Hello Elena, welcome to the Apex Industrial Screening. How do you handle subcritical CO2 cascade defrost cycles?",
        time: "2:10 PM",
      },
      {
        id: "e2",
        sender: "candidate",
        senderName: "Elena R.",
        text: "I program staggered hot gas or electric defrost cycles to prevent pressure spikes above 45 bar on the low stage, verifying EPR valve modulating position and receiver pressure.",
        time: "2:12 PM",
      },
      {
        id: "e3",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Flawless technical command. Score: 96/100. Forwarded to VP of Commercial Operations.",
        time: "2:13 PM",
      },
    ],
  },
  {
    id: "cand-4",
    name: "Marcus K.",
    role: "Commercial Service Tech",
    jobId: "job-1",
    score: 74,
    exp: "3 Years",
    status: "In Review",
    phone: "+1 (555) 567-8901",
    certifications: ["EPA Universal", "OSHA 10"],
    scoreBreakdown: {
      technical: 76,
      customerService: 72,
      reliability: 74,
      speed: 74,
    },
    aiInsights: {
      technicalValidation: "Solid 3-phase electrical troubleshooting (contactors, capacitors, relays, compressor motor windings). Minor hesitation on VFD inverter programming.",
      customerService: "Respectful and courteous demeanor. Suitable for commercial building maintenance contracts.",
      recommendation: "Solid mid-tier technician candidate. Ready for second-round technical lead interview.",
      strengths: ["3-Phase motors", "Nitrogen purge brazing", "Punctual"],
    },
    transcript: [
      {
        id: "m1",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Hi Marcus, how do you verify if a 3-phase commercial compressor is single-phasing?",
        time: "3:40 PM",
      },
      {
        id: "m2",
        sender: "candidate",
        senderName: "Marcus K.",
        text: "I check voltage phase-to-phase across L1-L2, L2-L3, and L1-L3 with a true-RMS multimeter, and then check amp draw per phase with an amp clamp while running to spot imbalances over 2%.",
        time: "3:42 PM",
      },
    ],
  },
  {
    id: "cand-5",
    name: "David C.",
    role: "Apprentice Technician",
    jobId: "job-2",
    score: 65,
    exp: "1 Year",
    status: "In Review",
    phone: "+1 (555) 678-9012",
    certifications: ["EPA Type I", "Trade School HVAC Diploma"],
    scoreBreakdown: {
      technical: 62,
      customerService: 72,
      reliability: 68,
      speed: 58,
    },
    aiInsights: {
      technicalValidation: "Understands fundamental refrigeration cycle and oxy-acetylene torch safety, but struggled with superheat calculation for fixed-orifice piston systems.",
      customerService: "Polite demeanor, very eager to learn, lacks commercial dispute resolution experience.",
      recommendation: "Consider for junior apprentice under a Senior Technician mentor. Potential for long-term growth.",
      strengths: ["Eager apprentice", "Clean driving record", "High energy"],
    },
    transcript: [
      {
        id: "d1",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Hi David! Welcome to your apprentice screening. How do you measure target superheat on a capillary tube or piston system?",
        time: "9:15 AM",
      },
      {
        id: "d2",
        sender: "candidate",
        senderName: "David C.",
        text: "I take outdoor dry-bulb temperature and indoor wet-bulb temperature, and check the target superheat chart provided by the manufacturer.",
        time: "9:18 AM",
      },
    ],
  },
  {
    id: "cand-6",
    name: "James M.",
    role: "General Handyman",
    jobId: "job-1",
    score: 32,
    exp: "10 Years",
    status: "Rejected by AI",
    phone: "+1 (555) 789-0123",
    certifications: ["General Carpentry License (No EPA)"],
    scoreBreakdown: {
      technical: 28,
      customerService: 40,
      reliability: 35,
      speed: 25,
    },
    aiInsights: {
      technicalValidation: "Failed EPA compliance safety protocols. Suggested venting refrigerant directly to atmospheric pressure to clear line blockage, a direct violation of Clean Air Act Section 608.",
      customerService: "Combative and defensive tone when questioned on safety regulations.",
      recommendation: "Rejected automatically by AI screening filter due to compliance safety violations and lack of EPA certification.",
      redFlags: "Illegal refrigerant venting proposal; no valid EPA license.",
      strengths: ["General carpentry", "Drywall patching"],
    },
    transcript: [
      {
        id: "j1",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Hi James. What recovery machine and cylinder protocol do you follow before replacing a burned-out hermetic compressor?",
        time: "4:01 PM",
      },
      {
        id: "j2",
        sender: "candidate",
        senderName: "James M.",
        text: "Honestly, for small leaks or compressor swaps, we usually just blow out the line with nitrogen and vent it out the window to save time.",
        time: "4:04 PM",
      },
      {
        id: "j3",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Notice: Venting regulated refrigerant is illegal under EPA regulations. Do you have an active EPA Section 608 Universal license?",
        time: "4:05 PM",
      },
      {
        id: "j4",
        sender: "candidate",
        senderName: "James M.",
        text: "No, don't need papers to know how to turn a wrench.",
        time: "4:06 PM",
      },
      {
        id: "j5",
        sender: "bot",
        senderName: "Apex AI Hiring Bot",
        text: "Application flagged and auto-rejected by compliance engine.",
        time: "4:07 PM",
      },
    ],
  },
];

type FilterTab = "All Candidates" | "Recommended" | "In Review" | "Rejected";

export default function RecruitmentEngine() {
  const { success, error, info } = useToast();

  // State
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [jobs, setJobs] = useState<JobOpening[]>(INITIAL_JOBS);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("cand-1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FilterTab>("All Candidates");
  const [sortOrder, setSortOrder] = useState<"score-desc" | "score-asc">("score-desc");

  // Modals
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState<boolean>(false);
  const [transcriptCandidate, setTranscriptCandidate] = useState<Candidate | null>(null);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState<boolean>(false);

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDept, setNewJobDept] = useState("Commercial Service");
  const [newJobRequirements, setNewJobRequirements] = useState("EPA Universal, 3+ years experience, clean driving record");
  const [newJobTargetScore, setNewJobTargetScore] = useState(85);

  // Selected candidate object
  const selectedCandidate = useMemo(() => {
    return candidates.find((c) => c.id === selectedCandidateId) || candidates[0];
  }, [candidates, selectedCandidateId]);

  // Filtered and sorted candidate list
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        // Job filter
        if (selectedJobId !== "all" && c.jobId !== selectedJobId) {
          return false;
        }

        // Tab filter
        if (activeTab === "Recommended" && c.status !== "Recommended" && c.status !== "Hired") {
          return false;
        }
        if (activeTab === "In Review" && c.status !== "In Review" && c.status !== "Interview Scheduled") {
          return false;
        }
        if (activeTab === "Rejected" && c.status !== "Rejected by AI") {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchRole = c.role.toLowerCase().includes(q);
          const matchStatus = c.status.toLowerCase().includes(q);
          const matchCerts = c.certifications.some((cert) => cert.toLowerCase().includes(q));
          return matchName || matchRole || matchStatus || matchCerts;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === "score-desc") return b.score - a.score;
        return a.score - b.score;
      });
  }, [candidates, selectedJobId, activeTab, searchQuery, sortOrder]);

  // Handler: Open transcript modal
  const handleOpenTranscript = (c: Candidate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTranscriptCandidate(c);
    setIsTranscriptModalOpen(true);
  };

  // Handler: Quick action buttons
  const handleCandidateAction = (
    c: Candidate,
    action: "hire" | "interview" | "decline",
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();

    if (action === "hire") {
      setCandidates((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, status: "Hired" } : item))
      );
      success("Candidate Hired!", `Official offer packet initiated for ${c.name} (${c.role}).`);
    } else if (action === "interview") {
      setCandidates((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, status: "Interview Scheduled" } : item))
      );
      info("Interview Scheduled", `Calendar invite sent to ${c.name} for tomorrow at 2:00 PM.`);
    } else if (action === "decline") {
      setCandidates((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, status: "Rejected by AI" } : item))
      );
      error("Candidate Declined", `${c.name} moved to archived pool. Automated polite notice delivered.`);
    }
  };

  // Handler: Create new job opening
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) {
      error("Error", "Please enter a valid job title.");
      return;
    }

    const newJob: JobOpening = {
      id: `job-${Date.now()}`,
      title: newJobTitle.trim(),
      department: newJobDept,
      candidateCount: 0,
      targetScore: Number(newJobTargetScore) || 80,
      status: "Active",
    };

    setJobs((prev) => [newJob, ...prev]);
    setSelectedJobId(newJob.id);
    setIsNewJobModalOpen(false);
    setNewJobTitle("");
    success(
      "Job Post Published!",
      `"${newJob.title}" is now active. AI screening bot is listening on WhatsApp.`
    );
  };

  // Metric stats
  const activeJobsCount = jobs.filter((j) => j.status === "Active").length;
  const totalCandidatesCount = candidates.length;
  const readyForInterviewCount = candidates.filter(
    (c) => c.status === "Recommended" || c.status === "Interview Scheduled"
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            AI Recruitment Engine
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Fully autonomous hiring: posts jobs, conducts technical WhatsApp screenings, and ranks qualified candidates.
          </p>
        </div>
        <button
          onClick={() => setIsNewJobModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Briefcase className="w-4 h-4" />
          Create New Job Post
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Jobs", value: activeJobsCount.toString(), color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Total Candidates", value: totalCandidatesCount.toString(), color: "text-slate-900 dark:text-white", bg: "bg-slate-50 dark:bg-slate-800" },
          { label: "AI Screened", value: "100%", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { label: "Ready for Final Interview", value: readyForInterviewCount.toString(), color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</h3>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Job Filter Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Role:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Active Job Openings ({candidates.length} candidates)</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({candidates.filter((c) => c.jobId === job.id).length} candidates)
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {(["All Candidates", "Recommended", "In Review", "Rejected"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid: Candidate Table + AI Reasoning Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Candidate Pipeline Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Candidate Pipeline</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Click any candidate to inspect live AI reasoning and scorecard
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, role, skill..."
                  className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors w-48 sm:w-56"
                />
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === "score-desc" ? "score-asc" : "score-desc")}
                title={`Sort by Score: ${sortOrder === "score-desc" ? "Highest first" : "Lowest first"}`}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Candidate</th>
                  <th className="py-3.5 px-5">AI Screening</th>
                  <th className="py-3.5 px-5">Exp</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                      No candidates found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((c) => {
                    const isSelected = selectedCandidate.id === c.id;
                    const isRecommended = c.status === "Recommended" || c.status === "Hired";
                    const isInReview = c.status === "In Review" || c.status === "Interview Scheduled";

                    const badgeColor = isRecommended
                      ? "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30"
                      : isInReview
                      ? "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30"
                      : "text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30";

                    const StatusIcon = isRecommended ? CheckCircle2 : isInReview ? Clock : XCircle;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCandidateId(c.id)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected
                            ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-l-indigo-600"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            {c.name}
                            {isSelected && (
                              <span className="text-[10px] uppercase font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                                Viewing
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{c.role}</div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  c.score >= 85 ? "bg-emerald-500" : c.score >= 60 ? "bg-amber-500" : "bg-rose-500"
                                }`}
                                style={{ width: `${c.score}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {c.score}/100
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {c.exp}
                        </td>

                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {c.status}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => handleOpenTranscript(c, e)}
                              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer"
                              title="View WhatsApp Chat Transcript"
                            >
                              View Transcript
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Reasoning & Candidate Scorecard Panel (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Interview Insights
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedCandidate.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCandidate.role} • {selectedCandidate.phone}</p>
              </div>

              <div className="text-right">
                <div className={`text-2xl font-black ${
                  selectedCandidate.score >= 85 ? "text-emerald-600 dark:text-emerald-400" : selectedCandidate.score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                }`}>
                  {selectedCandidate.score}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">AI Match Score</span>
              </div>
            </div>

            {/* Score Breakdown Bars */}
            <div className="mt-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Evaluation Breakdown</h4>
              
              <div className="space-y-2">
                {[
                  { label: "Technical Competence", val: selectedCandidate.scoreBreakdown.technical },
                  { label: "Customer Empathy", val: selectedCandidate.scoreBreakdown.customerService },
                  { label: "Reliability & On-Call", val: selectedCandidate.scoreBreakdown.reliability },
                  { label: "Diagnostic Speed", val: selectedCandidate.scoreBreakdown.speed },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <span>{item.label}</span>
                      <span className="font-bold">{item.val}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.val >= 85 ? "bg-emerald-500" : item.val >= 70 ? "bg-indigo-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${item.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Verified Credentials
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedCandidate.certifications.map((cert, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Reasoning Points */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Technical Validation:</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {selectedCandidate.aiInsights.technicalValidation}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Customer Service:</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {selectedCandidate.aiInsights.customerService}
                </p>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl">
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">AI Recommendation:</p>
                <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-1">
                  {selectedCandidate.aiInsights.recommendation}
                </p>
              </div>
            </div>

            {/* Quick Actions for Selected Candidate */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => handleOpenTranscript(selectedCandidate)}
                className="w-full py-2 px-3 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Read Full WhatsApp Interview
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={(e) => handleCandidateAction(selectedCandidate, "hire", e)}
                  className="py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Hire
                </button>
                <button
                  onClick={(e) => handleCandidateAction(selectedCandidate, "interview", e)}
                  className="py-2 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Calendar className="w-3.5 h-3.5" /> Interview
                </button>
                <button
                  onClick={(e) => handleCandidateAction(selectedCandidate, "decline", e)}
                  className="py-2 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <UserX className="w-3.5 h-3.5" /> Decline
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL 1: WhatsApp Transcript Modal */}
      <Modal
        isOpen={isTranscriptModalOpen}
        onClose={() => setIsTranscriptModalOpen(false)}
        size="2xl"
        title={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                WhatsApp Screening Transcript
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Candidate: {transcriptCandidate?.name} ({transcriptCandidate?.phone})
              </p>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Verified autonomous screening • Model: Gemini 2.5 Pro
            </div>
            <button
              onClick={() => {
                success("Transcript Exported", `Full Q&A transcript for ${transcriptCandidate?.name} saved to PDF.`);
                setIsTranscriptModalOpen(false);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> Export as PDF
            </button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {/* Candidate Summary Banner */}
          {transcriptCandidate && (
            <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Target Role:</span>
                <span className="text-slate-900 dark:text-white font-bold">{transcriptCandidate.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">AI Score:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{transcriptCandidate.score}/100</span>
              </div>
            </div>
          )}

          {/* Chat Messages Feed */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 max-h-[50vh] overflow-y-auto">
            {transcriptCandidate?.transcript.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                      isBot
                        ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
                        : "bg-emerald-600 text-white rounded-tr-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Create New Job Post */}
      <Modal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
        size="lg"
        title="Create New Job Opening"
        description="Publish an autonomous hiring campaign with an automated WhatsApp screening pipeline."
      >
        <form onSubmit={handleCreateJob} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Chiller Diagnostic Lead"
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={newJobDept}
                onChange={(e) => setNewJobDept(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Commercial Service">Commercial Service</option>
                <option value="Residential Service">Residential Service</option>
                <option value="Industrial Refrigeration">Industrial Refrigeration</option>
                <option value="HVAC Installation">HVAC Installation</option>
                <option value="Field Dispatch">Field Dispatch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Target Passing Score
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="60"
                  max="95"
                  value={newJobTargetScore}
                  onChange={(e) => setNewJobTargetScore(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 w-12 text-right">
                  {newJobTargetScore}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Required Certifications & Skills
            </label>
            <input
              type="text"
              value={newJobRequirements}
              onChange={(e) => setNewJobRequirements(e.target.value)}
              placeholder="e.g. EPA Universal, NATE, 3+ years experience"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-xs text-indigo-900 dark:text-indigo-300">
            <strong>Autonomous Pipeline Active:</strong> As soon as applicants text or apply online, Apex AI will initiate WhatsApp technical questioning and present scored candidates here.
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewJobModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              Publish Job Post
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
