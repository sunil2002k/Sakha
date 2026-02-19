import React from "react";
import { Link } from "react-router-dom";
import team from "../assets/team1.jpeg";
import { 
  Target, 
  Rocket, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  Lightbulb,
  Award,
  Users2,
  Globe
} from "lucide-react";

const About = () => {
  const teamMembers = [
    {
      name: "Sunil Kunwar",
      role: "Full Stack Developer",
      bio: "Passionate about building scalable web applications and AI integration.",
      avatar: team,
    },
    {
      name: "Sarah Chen",
      role: "UI/UX Designer",
      bio: "Creates beautiful and intuitive user experiences with a focus on accessibility.",
      avatar: "👩‍🎨"
    },
    {
      name: "Mike Rodriguez",
      role: "DevOps Engineer",
      bio: "Ensures smooth deployment and optimal performance across all platforms.",
      avatar: "👨‍🔧"
    },
    {
      name: "Emily Parker",
      role: "AI Specialist",
      bio: "Expert in machine learning and natural language processing technologies.",
      avatar: "👩‍🔬"
    }
  ];

  const features = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Get intelligent insights and recommendations for your project ideas using advanced machine learning algorithms."
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Project Incubation",
      description: "Transform your ideas into reality with our comprehensive project development and mentorship platform."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Funding Support",
      description: "Connect with potential investors and secure funding for your innovative projects through our platform."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description: "Join a vibrant community of creators, mentors, and innovators to collaborate and grow together."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Progress Tracking",
      description: "Monitor your project's development with detailed analytics and milestone tracking features."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Secure Platform",
      description: "Your ideas and data are protected with enterprise-grade security and privacy measures."
    }
  ];

  const stats = [
    { number: "500+", label: "Projects Analyzed" },
    { number: "95%", label: "Success Rate" },
    { number: "₹2.5M+", label: "Funds Raised" },
    { number: "50+", label: "Expert Mentors" }
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content transition-colors duration-300 pt-24">

      {/* Mission Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Our <span className="text-primary">Mission</span>
            </h2>
            <p className="text-lg opacity-70 mb-6 leading-relaxed">
              At InnovateU, we believe that every great idea deserves a chance to flourish. Our mission is to democratize
              access to project development resources by leveraging artificial intelligence and community collaboration.
            </p>
            <p className="text-lg opacity-70 mb-8 leading-relaxed">
              We've created a platform where innovators can validate their ideas, receive expert guidance, connect with
              mentors, and secure funding—all in one place.
            </p>
            
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-base-200 border border-base-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Our Vision</h3>
                <p className="text-sm opacity-60 font-medium">To become the world's most trusted platform for project innovation and development.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-base-200/50 backdrop-blur-md border border-base-300 rounded-3xl p-8 text-center hover:border-primary/50 transition-colors group">
                <div className="text-3xl md:text-4xl font-black text-primary mb-1 group-hover:scale-110 transition-transform">{stat.number}</div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-base-200/30 border-y border-base-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter">
              Why Choose <span className="text-primary underline decoration-wavy decoration-2 underline-offset-8">InnovateU?</span>
            </h2>
            <p className="text-lg opacity-60 max-w-2xl mx-auto font-medium">
              A comprehensive ecosystem designed to take your project from a napkin sketch to a global success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card bg-base-100 border border-base-300 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-2 group">
                <div className="card-body p-8">
                  <div className="w-14 h-14 bg-primary text-primary-content rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="card-title text-xl font-black">{feature.title}</h3>
                  <p className="text-sm opacity-70 leading-relaxed font-medium">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Meet Our <span className="text-primary">Core Team</span>
          </h2>
          <p className="text-lg opacity-60 max-w-2xl mx-auto font-medium">
            Building the infrastructure for the next generation of innovators.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary mb-6 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-base-100 overflow-hidden flex items-center justify-center">
                  {typeof member.avatar === 'string' && member.avatar.length > 2 ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-5xl">{member.avatar}</div>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-black">{member.name}</h3>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{member.role}</p>
              <p className="text-sm opacity-60 leading-relaxed font-medium italic">"{member.bio}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-primary text-primary-content">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter">Our Core Values</h2>
            <div className="w-24 h-1 bg-primary-content/30 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <Globe />, title: "Innovation", desc: "Pushing boundaries with AI to deliver future-ready solutions today." },
              { icon: <Users2 />, title: "Collaboration", desc: "Working together as one community to turn individual dreams into reality." },
              { icon: <Award />, title: "Excellence", desc: "Setting the gold standard in code quality, security, and user experience." }
            ].map((value, idx) => (
              <div key={idx} className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary-content/10 border border-primary-content/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  {React.cloneElement(value.icon, { className: "w-8 h-8" })}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{value.title}</h3>
                <p className="opacity-80 font-medium leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center px-4">
         <h2 className="text-3xl font-black mb-6">Ready to bring your idea to life?</h2>
         <Link to="/submit" className="btn btn-primary btn-lg rounded-full px-12 shadow-xl shadow-primary/20">
            Get Started Now
         </Link>
      </section>
    </div>
  );
};

export default About;