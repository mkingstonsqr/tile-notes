import { useState, useEffect } from 'react'
import { Brain, Calendar, Search, Tag, Zap, Sparkles, ArrowRight, CheckCircle, Star, Users, Shield, Smartphone } from 'lucide-react'
import { motion } from 'framer-motion'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Smart tagging, summarization, and task extraction powered by ChatGPT",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Calendar,
      title: "Visual Organization",
      description: "Beautiful calendar views and tile-based note organization",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Search,
      title: "Instant Search",
      description: "Find anything instantly with intelligent search and filtering",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Tag,
      title: "Smart Tagging",
      description: "Automatic and manual tagging with dynamic filtering",
      color: "from-orange-500 to-red-500"
    }
  ]

  const superpowers = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Capture thoughts instantly with multi-type note creation",
      demo: "Text, Voice, Image, Link notes in seconds"
    },
    {
      icon: Brain,
      title: "AI Assistant",
      description: "Your personal AI that understands your notes",
      demo: "Auto-tags, summarizes, and extracts tasks"
    },
    {
      icon: Sparkles,
      title: "Beautiful Design",
      description: "Apple-inspired glassmorphism interface",
      demo: "Smooth animations and intuitive interactions"
    },
    {
      icon: Calendar,
      title: "Time-Aware",
      description: "Organize notes by time with calendar integration",
      demo: "Daily views, reminders, and scheduling"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      avatar: "👩‍💼",
      quote: "TileNotes transformed how I organize my thoughts. The AI features are incredible!"
    },
    {
      name: "Marcus Rodriguez",
      role: "Designer",
      avatar: "👨‍🎨",
      quote: "Finally, a note-taking app that's as beautiful as it is functional."
    },
    {
      name: "Emily Watson",
      role: "Student",
      avatar: "👩‍🎓",
      quote: "The task extraction feature saves me hours of manual organization."
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 glass border-b border-white border-opacity-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">📝</span>
              </div>
              <span className="text-2xl font-bold text-white">TileNotes</span>
            </div>
            <button
              onClick={onGetStarted}
              className="btn-primary"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 
            className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The Future of
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Note-Taking</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Capture, organize, and discover your thoughts with AI-powered intelligence. 
            Beautiful, fast, and incredibly smart.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button
              onClick={onGetStarted}
              className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
            >
              <span>Start Taking Notes</span>
              <ArrowRight size={20} />
            </button>
            <button className="btn-ghost text-lg px-8 py-4">
              Watch Demo
            </button>
          </motion.div>

          {/* Feature Showcase */}
          <motion.div 
            className="mt-20 glass-card max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="p-8">
              <div className="flex items-center justify-center space-x-4 mb-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-xl transition-all duration-500 ${
                        currentFeature === index 
                          ? `bg-gradient-to-r ${feature.color} text-white scale-110` 
                          : 'bg-white bg-opacity-10 text-gray-300'
                      }`}
                    >
                      <Icon size={24} />
                    </div>
                  )
                })}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {features[currentFeature].title}
              </h3>
              <p className="text-gray-300">
                {features[currentFeature].description}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Superpowers Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              TileNotes Superpowers
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover what makes TileNotes the most intelligent and beautiful note-taking experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {superpowers.map((power, index) => {
              const Icon = power.icon
              return (
                <motion.div
                  key={index}
                  className="glass-card text-center group hover:scale-105"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${features[index % features.length].color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{power.title}</h3>
                  <p className="text-gray-300 mb-4">{power.description}</p>
                  <div className="text-sm text-blue-300 font-medium">{power.demo}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Intelligence That Understands You
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Smart Task Extraction</h3>
                    <p className="text-gray-300">AI automatically finds and organizes action items from your notes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Intelligent Tagging</h3>
                    <p className="text-gray-300">Contextual tags generated automatically, plus manual tagging support</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Content Summarization</h3>
                    <p className="text-gray-300">Long notes automatically summarized for quick reference</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card p-8">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 font-mono text-sm">
                <div className="text-green-400 mb-2">$ AI Processing Note...</div>
                <div className="text-white mb-4">
                  "Need to **buy groceries** tomorrow and **call mom** about dinner plans. Feeling excited about the weekend!"
                </div>
                <div className="text-blue-400 mb-2">✓ Tags: groceries, family, dinner, weekend</div>
                <div className="text-purple-400 mb-2">✓ Tasks: buy groceries, call mom</div>
                <div className="text-green-400">✓ Sentiment: positive</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Loved by Thousands
            </h2>
            <div className="flex justify-center items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="text-yellow-400 fill-current" />
              ))}
              <span className="text-white ml-2 text-lg">4.9/5 from 2,847 users</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="glass-card text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="glass-card">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">50K+</div>
                <div className="text-gray-300">Notes Created</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">15K+</div>
                <div className="text-gray-300">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                <div className="text-gray-300">Uptime</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">4.9★</div>
                <div className="text-gray-300">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="glass-card max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Note-Taking?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who've revolutionized how they capture and organize their thoughts.
            </p>
            <button
              onClick={onGetStarted}
              className="btn-primary text-xl px-10 py-5 flex items-center space-x-3 mx-auto"
            >
              <span>Start Free Today</span>
              <ArrowRight size={24} />
            </button>
            <p className="text-sm text-gray-400 mt-4">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white border-opacity-20 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">📝</span>
                </div>
                <span className="text-xl font-bold text-white">TileNotes</span>
              </div>
              <p className="text-gray-400">
                The future of intelligent note-taking.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Updates</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white border-opacity-20 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TileNotes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
