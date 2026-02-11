import React from "react";
import { Mail, Phone, MapPin, Clock,  } from "lucide-react";


export const Contact = () => {
  return (
    <>
      <div className="w-full text-center flex justify-center items-center  mt-4 py-20">
        <div className="px-6 md:px-16 py-12 bg-white text-gray-800 w-7xl mx-auto justify-center items-center">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Get In <span className="text-green-600">Touch</span>
            </h2>
            <p className="mt-4 text-gray-600 max-w-xl mx-auto">
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
                <Mail className="text-green-600 mt-1" />
                <div className="items-start">
                  <h3 className="text-lg font-semibold mb-1">Email Us</h3>
                  <p>hello@SayLess.com</p>
                  <p>support@SayLess.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <Phone className="text-green-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Call Us</h3>
                  <p>+234 (0) 123 456 7890</p>
                  <p>+234 (0) 088 765 4321</p>
                </div>
              </div>

              {/* Visit */}
              <div className="flex items-start gap-4">
                <MapPin className="text-green-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Visit Us</h3>
                  <p>123 Business District</p>
                  <p>Lagos, Nigeria</p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start gap-4">
                <Clock className="text-green-600 mt-1" />
                <div>
                  <h3 className="text-lg items-start font-semibold mb-1">Business Hours</h3>
                  <p>Mon - Fri: 9:00 AM - 5:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-md">
                <div className="flex items-start flex-col gap-2">
                  <h3 className="text-lg font-semibold  block ">
                    Quick Response Guarantee
                  </h3>
                  <p className="">
                    We respond to all inquiries within 24 hours during business
                    days.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <form className="space-y-6 bg-gray-100 p-8 rounded-md ">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Full Name*</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none  focus:shadow-green-400 focus:shadow-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none  focus:shadow-green-400 focus:shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Company Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:shadow-green-400 focus:shadow-sm"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Message*</label>
                <textarea
                  required
                  rows="5"
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none  focus:shadow-green-400 focus:shadow-sm"
                  placeholder="Tell us about your project..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white  px-6 w-full py-3 rounded font-semibold group  hover:bg-green-700 transition"
              >
                Send Message  
              </button>
            
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
