// Alpha Romer Coma's Resume - Extracted from PDF and structured for intelligent chunking
// Each section will be embedded separately for precise retrieval

export interface ResumeSection {
    category: string;
    title: string;
    content: string;
}

export const resumeSections: ResumeSection[] = [
    // Personal Info
    {
        category: "personal",
        title: "Contact Information and Summary",
        content: "Alpha Romer Coma is an AI Engineer. Website: alpharomer.vercel.app. LinkedIn: linkedin.com/in/alpharomercoma. GitHub: github.com/alpharomercoma. Alpha specializes in deep learning and high-performance computing, with a $376k compute grant by Google Cloud."
    },

    // Technical Skills
    {
        category: "skills",
        title: "Machine Learning Skills",
        content: "Alpha's machine learning skills include: Python, PyTorch, Keras, Scikit-Learn, and TPU (Tensor Processing Unit) programming."
    },
    {
        category: "skills",
        title: "Software Engineering Skills",
        content: "Alpha's software engineering skills include: React, TypeScript, NextJS, NodeJS, Express, Flask, and PostgreSQL."
    },
    {
        category: "skills",
        title: "Cloud Engineering Skills",
        content: "Alpha's cloud engineering skills include: Google Cloud, AWS, Azure, Terraform, Docker, Kubernetes, Git, and GitHub Actions."
    },

    // Work Experience
    {
        category: "experience",
        title: "Associate Cloud Engineer at Kollab (Sep 2025 - Present)",
        content: "Alpha currently works as an Associate Cloud Engineer at Kollab since September 2025. This is Alpha's most recent and current job. Alpha developed an Employee Management System called Krew for People Operations to manage 100+ Kollab employees. Alpha also built a Tax Management System called KalTAX for 3 stakeholders to compute and visualize employee taxes."
    },
    {
        category: "experience",
        title: "AI Competency Curriculum Validator at TESDA (Aug 2025)",
        content: "Alpha worked as an AI Competency Curriculum Validator (Contract) at TESDA (Technical Education and Skills Development Authority) in August 2025. Alpha was contracted as an Academe Expert in the Competency-Based Curriculum in AI Competency Standards. Alpha validated 2 AI and Data Qualifications, impacting the Philippines' technical-vocational education system."
    },
    {
        category: "experience",
        title: "AI Engineer Intern at AI First (Dec 2024 - Aug 2025)",
        content: "Alpha worked as an AI Engineer Intern at AI First from December 2024 to August 2025. Alpha built a Python scraper that extracted 200k+ enriched leads at zero hosting cost. Alpha designed 2 production system architectures and APIs for an AI-powered app generator. Alpha tested 2 production AI systems and documented over 50 bugs for a cross-platform application."
    },

    // Publications
    {
        category: "publications",
        title: "Visual-Qwen Research Publication",
        content: "Alpha published research titled 'Visual-Qwen: Augmenting Multimodal Deep Learning with Attention Mechanisms to Recognize Sludge Videos from Short-Form Content' in July 2025. Alpha secured $376,000 in compute grants from Google's TPU Research Cloud (TRC) and YouTube Research. Alpha architected a 92% accurate novel Vision-Language Model for cognitively-degrading video content. The research was validated by 10 machine learning experts, 20 content creators, 20 content moderators, and 3 data scientists in the Philippines. Alpha curated a 6,000-row specialized multimodal dataset with 200+ monthly downloads on Kaggle."
    },

    // Projects
    {
        category: "projects",
        title: "TS-JobSpy Project",
        content: "Alpha created TS-JobSpy, an Indeed and LinkedIn Job Scraper (Aug 2025 - Sep 2025). It is an open-source TypeScript package with peak 300+ downloads per week on npm. The scraper can scrape approximately 7200 jobs per minute with 100% success rate across 60+ countries in any industry."
    },

    // Certifications
    {
        category: "certifications",
        title: "Professional Certifications",
        content: "Alpha holds the following certifications: Google Professional Machine Learning Engineer, AWS Certified Machine Learning Engineer – Associate, Google Associate Cloud Engineer, and Microsoft Certified Azure AI Engineer Associate."
    },

    // Leadership & Activities
    {
        category: "leadership",
        title: "AWS re:Invent 2025 All Builders Welcome Grantee",
        content: "Alpha was an AWS re:Invent 2025 All Builders Welcome Grantee (Dec 2025). Alpha was granted a fully-sponsored grant to attend the 5-day AWS re:Invent 2025 Conference in Las Vegas, Nevada. Alpha was the sole Filipino Grant Recipient among the 340 international recipients."
    },
    {
        category: "leadership",
        title: "GitHub Campus Expert",
        content: "Alpha is a GitHub Campus Expert since December 2024 to present. Alpha taught 3000+ students and professionals from 10+ organizations, including Microsoft, about AI-driven software engineering. Alpha secured $30k and counting in sponsorships from GitHub, Tavily, and Vercel for educational empowerment in tech in Luzon, Philippines."
    },

    // Education
    {
        category: "education",
        title: "University Education",
        content: "Alpha attended FEU Institute of Technology, graduating with a BS in Computer Science with specialization in Software Engineering (started August 2022). Alpha was a 4-Year President's Scholar with High Honors and CS Academic Varsity."
    },

    // Awards
    {
        category: "awards",
        title: "National AI Prompt Design Challenge",
        content: "Alpha won the National AI Prompt Design Challenge as Champion, awarded by Straits Interactive in July 2025."
    },
    {
        category: "awards",
        title: "Philippine Junior Data Science Challenge",
        content: "Alpha was a Philippine Junior Data Science Challenge Top 10 Finalist and GlobalCo Special Awards Winner, awarded by UP Data Science Society in November 2024."
    },
    {
        category: "awards",
        title: "NASA Space Apps Challenge",
        content: "Alpha was a Space Apps 2023 Global Nominee and Galactic Problem Solver, awarded by National Aeronautics and Space Administration (NASA) in November 2023."
    }
];
