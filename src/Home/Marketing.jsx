import React from "react";
import { Megaphone, ArrowRight, BarChart2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Nav } from "./Nav";
import { Footer } from "../pages/Footer";
import { motion } from "framer-motion";

export const Marketing = () => {
  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <Nav />
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex justify-center items-center w-full mt-15 bg-white dark:bg-gray-900 transition-colors">
          <div className="text-center max-w-[50rem] flex justify-center items-center flex-col mt-10 mb-6">
            <h1 className="font-bold text-gray-800 dark:text-white mb-2">
              <span className="text-4xl font-bold text-gray-800 dark:text-white">
                Our Marketing
              </span>
              <span className="text-4xl font-bold text-green-600 dark:text-green-500">
                {" "}
                Services
              </span>
            </h1>
            <p className="text-gray-800 dark:text-gray-300 text-[20px]">
              {" "}
              We offer comprehensive marketing solutions designed to grow your
              business and maximize every naira invested.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 py-10">
          {/* Service Card 1 */}
          <div className="group hover:border-green-200 dark:hover:border-green-600 flex flex-col border-gray-200 dark:border-gray-700 border-[1px] p-8 bg-white dark:bg-gray-800 hover:shadow-lg dark:hover:shadow-xl rounded-lg h-[458px] max-w-[397.5px] mx-auto mt-10 hover:scale-105 transition-all duration-300 ease-in-out">
            <Megaphone className="w-14 h-14 text-green-600 dark:text-green-500 stroke-green-600 dark:stroke-green-500 transition-colors group-hover:stroke-white group-hover:bg-green-600 bg-green-100 dark:bg-green-900/30 p-2 rounded-md" />
            <p className="text-2xl font-bold text-black dark:text-white my-4">
              Digital Marketing Strategy
            </p>
            <p className="text-gray-800 dark:text-gray-300 mb-4 max-w-[300px] leading-relaxed">
              Comprehensive digital marketing plans tailored to your business
              goals and target audience.
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-400 mb-4">
              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-green-600 dark:before:bg-green-500 before:rounded-full">
                SEO Optimization
              </div>
              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-green-600 dark:before:bg-green-500 before:rounded-full">
                Social Media Strategy
              </div>
              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-green-600 dark:before:bg-green-500 before:rounded-full">
                Content Planning
              </div>
            </ul>
            <a
              href="#"
              className="group inline-flex items-center text-green-600 dark:text-green-500 group-hover:underline"
            >
              Learn more
              <ArrowRight className="w-[25px] ml-1 transition-transform duration-200 group-hover:translate-x-1 h-[14px] stroke-[1.2]" />
            </a>
          </div>

          {/* Service Card 2 */}
          <div className="group hover:border-green-200 dark:hover:border-green-600 flex flex-col border-gray-200 dark:border-gray-700 border-[1px] p-8 bg-white dark:bg-gray-800 hover:shadow-lg dark:hover:shadow-xl rounded-lg h-[458px] max-w-[397.5px] mx-auto mt-10 hover:scale-105 transition-all duration-300 ease-in-out">
            <BarChart2 className="w-14 h-14 text-green-600 dark:text-green-500 stroke-green-600 dark:stroke-green-500 transition-colors group-hover:stroke-white group-hover:bg-green-600 bg-green-100 dark:bg-green-900/30 p-2 rounded-md" />
            <p className="text-2xl font-bold text-black dark:text-white my-4">
              Analytics & Insights
            </p>
            <p className="text-gray-800 dark:text-gray-300 mb-4 max-w-[300px] leading-relaxed">
              Data-driven insights to optimize your campaigns and maximize ROI.
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-400 mb-4">
              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-green-600 dark:before:bg-green-500 before:rounded-full">
                Performance Tracking
              </div>
              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-green-600 dark:before:bg-green-500 before:rounded-full">
                ROI Analysis
              </div>
              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-green-600 dark:before:bg-green-500 before:rounded-full">
                Custom Reporting
              </div>
            </ul>
            <a
              href="#"
              className="group inline-flex items-center text-green-600 dark:text-green-500 group-hover:underline"
            >
              Learn more
              <ArrowRight className="w-[25px] ml-1 transition-transform duration-200 group-hover:translate-x-1 h-[14px] stroke-[1.2]" />
            </a>
          </div>

          {/* Service Card 3 */}
          <div className="group hover:border-green-200 dark:hover:border-green-600 flex flex-col border-gray-200 dark:border-gray-700 border-[1px] p-8 bg-white dark:bg-gray-800 hover:shadow-lg dark:hover:shadow-xl rounded-lg h-[458px] max-w-[397.5px] mx-auto mt-10 hover:scale-105 transition-all duration-300 ease-in-out">
            <Users className="w-14 h-14 text-green-600 dark:text-green-500 stroke-green-600 dark:stroke-green-500 transition-colors group-hover:stroke-white group-hover:bg-green-600 bg-green-100 dark:bg-green-900/30 p-2 rounded-md" />
            <p className="text-2xl font-bold text-black dark:text-white my-4">
              Brand Development
            </p>
            <p className="text-gray-800 dark:text-gray-300 mb-4 max-w-[300px] leading-relaxed">
              Build a strong, memorable brand that resonates with your audience.
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-400 mb-4">
              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-green-600 dark:before:bg-green-500 before:rounded-full">
                Brand Identity
              </div>
              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-green-600 dark:before:bg-green-500 before:rounded-full">
                Brand Messaging
              </div>
              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-green-600 dark:before:bg-green-500 before:rounded-full">
                Visual Design
              </div>
            </ul>
            <Link
              to="/signup"
              className="group inline-flex items-center text-green-600 dark:text-green-500 group-hover:underline"
            >
              Learn more
              <ArrowRight className="w-[25px] ml-1 transition-transform duration-200 group-hover:translate-x-1 h-[14px] stroke-[1.2]" />
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex justify-center items-center mb-8 w-full mt-4 bg-transparent">
          <div className="text-center py-12 w-full bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 rounded-none linear flex justify-center items-center flex-col mt-10 mb-6 transition-colors">
            <h1 className="text-white font-bold text-[30px] mb-5">
              Ready to Transform Your Marketing?
            </h1>
            <p className="text-green-100 dark:text-green-200 text-[20px] mx-auto max-w-[800px] mb-6 px-4">
              Let's discuss how our proven strategies can help your business
              grow and succeed in today's competitive market.
            </p>
            <Link to="/signup">
              <button className="py-4 px-6 mt-4 text-[20px] bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-300 flex items-center space-x-2 cursor-pointer">
                Get Free Consultation
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
