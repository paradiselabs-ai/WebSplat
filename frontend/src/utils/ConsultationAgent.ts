interface Question {
  text: string;
  maxAutonomyLevel: number;
}

const questionBank: Question[] = [
  { text: "What's the purpose or reason behind your website?", maxAutonomyLevel: 99 },
  { text: "Who is your target audience?", maxAutonomyLevel: 95 },
  { text: "What are the main goals you want to achieve with this website?", maxAutonomyLevel: 90 },
  { text: "Do you have any specific branding guidelines or logo to incorporate?", maxAutonomyLevel: 85 },
  { text: "What are the key features or services you want to highlight?", maxAutonomyLevel: 80 },
  { text: "Can you describe the overall tone or mood you want for your website (e.g., professional, friendly, innovative)?", maxAutonomyLevel: 75 },
  { text: "Are there any competitor websites you admire or want to differentiate from?", maxAutonomyLevel: 70 },
  { text: "Do you need any specific forms or contact methods on your website?", maxAutonomyLevel: 65 },
  { text: "Would you like to integrate any social media platforms?", maxAutonomyLevel: 60 },
  { text: "Do you have any preferences for the website's color scheme?", maxAutonomyLevel: 55 },
  { text: "What type of content will you be regularly updating on the website?", maxAutonomyLevel: 50 },
  { text: "Do you need any e-commerce functionality?", maxAutonomyLevel: 45 },
  { text: "Are there any specific accessibility requirements we should consider?", maxAutonomyLevel: 40 },
  { text: "Would you like to include a blog or news section?", maxAutonomyLevel: 35 },
  { text: "Do you need multi-language support for your website?", maxAutonomyLevel: 30 },
  { text: "Are there any specific SEO goals or keywords you want to focus on?", maxAutonomyLevel: 25 },
  { text: "Do you want to include any interactive elements or animations?", maxAutonomyLevel: 20 },
  { text: "Would you like to integrate any third-party tools or services (e.g., CRM, analytics)?", maxAutonomyLevel: 15 },
  { text: "Do you have any preferences for the website's navigation structure?", maxAutonomyLevel: 10 },
  { text: "Are there any specific legal requirements or disclaimers we need to include?", maxAutonomyLevel: 5 },
];

export class ConsultationAgent {
  private autonomyLevel: number;

  constructor(autonomyLevel: number) {
    this.autonomyLevel = autonomyLevel;
  }

  setAutonomyLevel(level: number) {
    this.autonomyLevel = level;
  }

  getNextQuestion(): string | null {
    const applicableQuestions = questionBank.filter(q => q.maxAutonomyLevel >= this.autonomyLevel);
    return applicableQuestions.length > 0 ? applicableQuestions[0].text : null;
  }

  getAllQuestions(): string[] {
    return questionBank
      .filter(q => q.maxAutonomyLevel >= this.autonomyLevel)
      .map(q => q.text);
  }
}