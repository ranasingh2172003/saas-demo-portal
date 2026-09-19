export interface InboxMessage {
  id: string;
  sender: "lead" | "user" | "ai";
  senderName: string;
  text: string;
  time: string;
}

export interface LeadConversation {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarColor: string;
  sentiment: "Positive Intent (98%)" | "Meeting Requested (95%)" | "Polite Objection" | "Qualified (92%)";
  sentimentType: "positive" | "neutral";
  time: string;
  status: "Qualified" | "Meeting Booked" | "In Nurture";
  messages: InboxMessage[];
  aiSuggestedReply: string;
}

export interface CampaignData {
  id: string;
  name: string;
  isRunning: boolean;
  targetIndustry: string;
  targetTitles: string[];
  location: string;
  connectionTemplate: string;
  followUpTemplate: string;
}

export const INITIAL_CAMPAIGNS: CampaignData[] = [
  {
    id: "camp-1",
    name: "Commercial Real Estate & High-Rise Operations",
    isRunning: true,
    targetIndustry: "Commercial Real Estate",
    targetTitles: ["Property Managers", "Facility Directors", "Real Estate Owners"],
    location: "Greater Metropolitan Area (50 miles)",
    connectionTemplate:
      "Hi {firstName}, noticed you manage commercial facilities across {company}. We provide certified 24/7 commercial HVAC maintenance and rapid 2-hour response. Would love to connect!",
    followUpTemplate:
      "Checking in {firstName}! If you ever need emergency AC service or seasonal preventive maintenance, we offer free facility evaluations.",
  },
  {
    id: "camp-2",
    name: "Data Centers & Mission-Critical Cooling",
    isRunning: false,
    targetIndustry: "Data Centers & Telecommunications",
    targetTitles: ["VP of Infrastructure", "Data Center Manager", "Critical Systems Director"],
    location: "Tri-State Technology Corridor",
    connectionTemplate:
      "Hi {firstName}, saw your expansion at {company}. We specialize in 99.999% precision CRAC and chilled water loop redundancy for high-density server halls.",
    followUpTemplate:
      "Hi {firstName}, happy to share our 2026 redundancy case study on preventing thermal throttle in tier-3 data facilities.",
  },
];

export const INITIAL_CONVERSATIONS: LeadConversation[] = [
  {
    id: "lead-1",
    name: "Robert Chen",
    role: "Director of Facilities",
    company: "Metro Commercial Properties",
    avatarColor: "bg-blue-600",
    sentiment: "Positive Intent (98%)",
    sentimentType: "positive",
    time: "2h ago",
    status: "Qualified",
    aiSuggestedReply:
      "Absolutely Robert! I understand how critical 100% uptime is for a 45-story commercial high-rise. I can have our Commercial Engineering Lead reach out directly. Does Tuesday at 10 AM or Wednesday at 2 PM work for a brief 15-minute introductory call?",
    messages: [
      {
        id: "m1",
        sender: "user",
        senderName: "Apex Cooling B2B Outreach",
        text: "Hi Robert, noticed you manage commercial buildings for Metro Commercial Properties in downtown. We handle commercial HVAC maintenance and 2-hour emergency chiller response. Would love to connect!",
        time: "Yesterday, 9:30 AM",
      },
      {
        id: "m2",
        sender: "lead",
        senderName: "Robert Chen",
        text: "Thanks for connecting. We actually have an issue with our main chiller block in Tower B and our current vendor is backlogged. Do you guys handle 300-ton Daikin systems?",
        time: "Today, 10:15 AM",
      },
    ],
  },
  {
    id: "lead-2",
    name: "Sarah Jenkins",
    role: "VP of Operations",
    company: "Northside Tech Campus",
    avatarColor: "bg-emerald-600",
    sentiment: "Meeting Requested (95%)",
    sentimentType: "positive",
    time: "4h ago",
    status: "Meeting Booked",
    aiSuggestedReply:
      "Fantastic, Sarah! I've sent a calendar invite to sarah.jenkins@northsidetech.com with a Microsoft Teams link. We're looking forward to walking the campus with you.",
    messages: [
      {
        id: "m1",
        sender: "user",
        senderName: "Apex Cooling B2B Outreach",
        text: "Hi Sarah! With the summer heat coming, we're helping tech campuses in the Northside corridor reduce their HVAC energy footprint by up to 22%. Would love to share our framework.",
        time: "Monday, 2:00 PM",
      },
      {
        id: "m2",
        sender: "lead",
        senderName: "Sarah Jenkins",
        text: "Interesting timing. We are actually putting out an RFP next month for a campus-wide HVAC retrofit. I'm open to a quick chat. Thursday at 11am?",
        time: "Today, 9:45 AM",
      },
    ],
  },
  {
    id: "lead-3",
    name: "Michael Torres",
    role: "General Manager",
    company: "Sunset Boutique Hotels",
    avatarColor: "bg-amber-600",
    sentiment: "Qualified (92%)",
    sentimentType: "positive",
    time: "1d ago",
    status: "Qualified",
    aiSuggestedReply:
      "Michael, totally understand. PTAC units in hotel rooms are notoriously loud when aging. We recently replaced 120 units at a similar boutique property, achieving a 40% noise reduction. We'd love to drop by and inspect one of your noisy units at no cost. Are you around next week?",
    messages: [
      {
        id: "m1",
        sender: "user",
        senderName: "Apex Cooling B2B Outreach",
        text: "Hi Michael, love what you've done with the new Sunset Boutique expansion. We specialize in hospitality HVAC solutions that operate silently so your guests sleep perfectly. Let's connect!",
        time: "Last Week",
      },
      {
        id: "m2",
        sender: "lead",
        senderName: "Michael Torres",
        text: "We are having major noise complaints about the PTAC units in our older wing. Do you guys service those or just central air?",
        time: "Yesterday, 4:20 PM",
      },
    ],
  },
];
