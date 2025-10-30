import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Full Stack Developer",
      bio: "Passionate about building scalable web applications and AI integration.",
      avatar: "👨‍💻"
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
      icon: "🤖",
      title: "AI-Powered Analysis",
      description: "Get intelligent insights and recommendations for your project ideas using advanced machine learning algorithms."
    },
    {
      icon: "🚀",
      title: "Project Incubation",
      description: "Transform your ideas into reality with our comprehensive project development and mentorship platform."
    },
    {
      icon: "💰",
      title: "Funding Support",
      description: "Connect with potential investors and secure funding for your innovative projects through our platform."
    },
    {
      icon: "👥",
      title: "Community Driven",
      description: "Join a vibrant community of creators, mentors, and innovators to collaborate and grow together."
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description: "Monitor your project's development with detailed analytics and milestone tracking features."
    },
    {
      icon: "🔒",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20">
     

      {/* Mission Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Our <span className="text-purple-400">Mission</span>
            </h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              At Sakha, we believe that every great idea deserves a chance to flourish. Our mission is to democratize 
              access to project development resources by leveraging artificial intelligence and community collaboration.
            </p>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              We've created a platform where innovators can validate their ideas, receive expert guidance, connect with 
              mentors, and secure funding—all in one place.
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Vision</h3>
                <p className="text-gray-400">To become the world's most trusted platform for project innovation and development.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose <span className="text-purple-400">Sakha?</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our platform offers comprehensive tools and features to support your project journey from idea to execution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 group">
                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 mb-4 group-hover:bg-purple-500/30 transition-colors">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Meet Our <span className="text-purple-400">Team</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Passionate professionals dedicated to building the future of project development.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                {member.avatar}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
              <p className="text-purple-400 font-semibold mb-3">{member.role}</p>
              <p className="text-gray-300 text-sm leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our <span className="text-purple-400">Values</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30 mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Innovation</h3>
              <p className="text-gray-300">
                We constantly push boundaries and embrace new technologies to deliver cutting-edge solutions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30 mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Collaboration</h3>
              <p className="text-gray-300">
                We believe in the power of community and work together to achieve extraordinary results.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30 mx-auto mb-4">
                <span className="text-2xl">💫</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Excellence</h3>
              <p className="text-gray-300">
                We strive for the highest standards in everything we do, from code quality to user experience.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;