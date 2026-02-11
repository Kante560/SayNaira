import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const Contact = () => {
  return (
    <div className="w-full text-center flex justify-center items-center mt-4 py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="px-6 md:px-16 py-12 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 w-7xl mx-auto justify-center items-center transition-colors">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Get In <span className="text-green-600 dark:text-green-500">Touch</span>
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Ready to transform your marketing thoughts into reality? Let's
            discuss how we can help your business grow.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Contact Info */}
          <div className="space-y-8">
            {/* Email */}
            <div className="flex items-start gap-4">
              <Mail className="text-green-600 dark:text-green-500 mt-1" />
              <div className="items-start text-left">
                <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Email Us</h3>
                <p className="text-gray-700 dark:text-gray-300">hello@SayLess.com</p>
                <p className="text-gray-700 dark:text-gray-300">support@SayLess.com</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <Phone className="text-green-600 dark:text-green-500 mt-1" />
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Call Us</h3>
                <p className="text-gray-700 dark:text-gray-300">+234 (0) 123 456 7890</p>
                <p className="text-gray-700 dark:text-gray-300">+234 (0) 088 765 4321</p>
              </div>
            </div>

            {/* Visit */}
            <div className="flex items-start gap-4">
              <MapPin className="text-green-600 dark:text-green-500 mt-1" />
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Visit Us</h3>
                <p className="text-gray-700 dark:text-gray-300">123 Business District</p>
                <p className="text-gray-700 dark:text-gray-300">Lagos, Nigeria</p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="flex items-start gap-4">
              <Clock className="text-green-600 dark:text-green-500 mt-1" />
              <div className="text-left">
                <h3 className="text-lg items-start font-semibold mb-1 text-gray-900 dark:text-white">Business Hours</h3>
                <p className="text-gray-700 dark:text-gray-300">Mon - Fri: 9:00 AM - 5:00 PM</p>
                <p className="text-gray-700 dark:text-gray-300">Saturday: 10:00 AM - 4:00 PM</p>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md transition-colors">
              <div className="flex items-start flex-col gap-2 text-left">
                <h3 className="text-lg font-semibold block text-gray-900 dark:text-white">
                  Quick Response Guarantee
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We respond to all inquiries within 24 hours during business
                  days.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <form className="space-y-6 bg-gray-100 dark:bg-gray-800 p-8 rounded-md transition-colors">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-200">Full Name*</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-200">
                  Email Address*
                </label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-900 dark:text-gray-200">Company Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-900 dark:text-gray-200">Message*</label>
              <textarea
                required
                rows="5"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                placeholder="Tell us about your project..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-green-600 dark:bg-green-700 text-white px-6 w-full py-3 rounded font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
