import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Zap, Globe, MessageCircle, Video, DollarSign, Users, Eye, Lock, CheckCircle } from "lucide-react";

export const Hero = () => {
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-gray-950 to-gray-950"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-green-400">No download needed — works in your browser</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Connect with{" "}
              <span className="text-green-400">anyone, anywhere</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              SayLess brings people together with lightning-fast messaging, crystal-clear calls,
              and seamless content sharing — all from your browser, no installs required.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <Link to="/signup">
              <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition flex items-center gap-2 shadow-lg shadow-green-600/30">
                Create Your Account
                <span>→</span>
              </button>
            </Link>

          </motion.div>

          {/* Feature badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-green-400" />
              <span>End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-green-400" />
              <span>Real-Time Messaging</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-green-400" />
              <span>Works everywhere</span>
            </div>
          </motion.div>

          {/* App Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
              {/* Browser chrome */}
              <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-gray-900/50 px-4 py-1.5 rounded-lg text-sm text-gray-500 border border-gray-700">
                    🔒 app.sayless.com
                  </div>
                </div>
              </div>

              {/* App interface mockup */}
              <div className="grid md:grid-cols-2 bg-gray-900/80">
                {/* Chat list */}
                <div className="border-r border-gray-800 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold">
                      SL
                    </div>
                    <h3 className="font-bold text-green-400">My Chats</h3>
                  </div>
                  <div className="space-y-2">
                    {["Adaeze O.", "Tech Squad 🚀", "Tunde B.", "Family Group", "Ngozi A."].map((name, i) => (
                      <div key={i} className={`p-3 rounded-lg ${i === 0 ? 'bg-gray-800' : 'bg-gray-900/50'} hover:bg-gray-800/70 transition cursor-pointer`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${i === 0 ? 'bg-green-500' : 'bg-gray-700'} rounded-full`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{name}</p>
                            <p className="text-xs text-gray-500 truncate">Last message preview...</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat window */}
                <div className="p-4 flex flex-col">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-800">
                    <div className="w-10 h-10 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Adaeze O.</p>
                      <p className="text-xs text-green-400">online</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-2 max-w-[70%]">
                        <p className="text-sm">Just sent you the payment 💸</p>
                        <p className="text-[10px] text-gray-500 mt-1">2:45 PM</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-green-600 rounded-2xl rounded-tr-none px-4 py-2 max-w-[70%]">
                        <p className="text-sm">Got it! Thanks ✨</p>
                        <p className="text-[10px] text-green-200 mt-1">2:46 PM ✓✓</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-2 max-w-[70%]">
                        <p className="text-sm">Let's add the whole team 🚀</p>
                        <p className="text-[10px] text-gray-500 mt-1">2:47 PM</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 bg-gray-800/50 rounded-full px-4 py-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                      disabled
                    />
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-sm">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gray-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-5xl font-bold text-green-400 mb-2">10+</h3>
              <p className="text-gray-400">Active Users</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-5xl font-bold text-green-400 mb-2">99.9%</h3>
              <p className="text-gray-400">Uptime</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-5xl font-bold text-green-400 mb-2">0.1s</h3>
              <p className="text-gray-400">Avg Delivery</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need, <span className="text-green-400">one app</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From messaging to payments, SayLess keeps your world connected and your wallet moving.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <MessageCircle size={24} />,
                title: "Instant Messaging",
                description: "Send texts, photos, videos and voice notes with blazing-fast delivery across any network."
              },
              {
                icon: <Video size={24} />,
                title: "HD Video Calls",
                description: "Crystal-clear video and voice calls that work even on low bandwidth connections."
              },
              {
                icon: <Users size={24} />,
                title: "Group Spaces",
                description: "Create communities of up to 10,000 members with channels, polls and shared media."
              },
              {
                icon: <Eye size={24} />,
                title: "Status & Stories",
                description: "Share moments with your network through disappearing stories and status updates."
              },
              {
                icon: <Lock size={24} />,
                title: "Privacy First",
                description: "End-to-end encryption on every message, call, and transaction. Your data stays yours."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-green-500/30 transition group"
              >
                <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Africa-focused Section */}
      <section className="py-20 px-6 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Built for the way <span className="text-green-400">Africa connects</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                SayLess was designed from the ground up for African communities. Whether you're chatting
                with family, coordinating with your team, or sending money home — we make it effortless.
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Works on any device</h4>
                    <p className="text-gray-400 text-sm">Optimized for low-end phones and slow connections</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Lightweight app</h4>
                    <p className="text-gray-400 text-sm">Under 15MB — won't eat up your storage</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Local languages</h4>
                    <p className="text-gray-400 text-sm">Available in Yoruba, Igbo, Hausa, Pidgin and more</p>
                  </div>
                </div>
              </div>

              <Link to="/signup">
                <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition shadow-lg shadow-green-600/30">
                  Try It Now — Free
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold mb-6">Growing fast</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-4">
                  <p className="text-3xl font-bold text-green-400 mb-1">10+</p>
                  <p className="text-sm text-gray-500">Users</p>
                </div>
                <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-4">
                  <p className="text-3xl font-bold text-green-400 mb-1">190+</p>
                  <p className="text-sm text-gray-500">Countries</p>
                </div>
                <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-4">
                  <p className="text-3xl font-bold text-green-400 mb-1">20+</p>
                  <p className="text-sm text-gray-500">Messages/day</p>
                </div>
                <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-4">
                  <p className="text-3xl font-bold text-green-400 mb-1">₦50B+</p>
                  <p className="text-sm text-gray-500">Transferred</p>
                </div>
              </div>
              <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-4">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-green-600 to-green-400 w-3/4"></div>
                </div>
                <p className="text-sm text-gray-500">75% growth in the last 2 months</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-sm mb-6">
              <span className="text-green-400">Free to use, forever</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to connect <span className="text-green-400">differently?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join hundreds already using SayLess to chat and call  — right from your browser.
              No downloads, no installs.
            </p>
          </motion.div>

          <Link to="/signup">
            <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition shadow-lg shadow-green-600/30 text-lg mb-6">
              💬 Open SayLess in Browser
            </button>
          </Link>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              <span>Desktop</span>
            </div>
            {/* <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              <span>Mobile Web</span>
            </div> */}
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              <span>Any Browser</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
