import React from "react";
import { Megaphone, ArrowRight, BarChart2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Contact } from "../pages/Contact";
import { Users2 } from "lucide-react";
import { Nav } from "./Nav";

export const About = () => {
  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <Nav />
      <div className="flex justify-center items-center  w-full  mt-8 bg-white dark:bg-gray-900 transition-colors">
        <div className="text-center max-w-[50rem] flex justify-center items-center flex-col mt-10 mb-6">
          <h1 className=" font-bold text-gray-800 dark:text-gray-100 mb-6 ">
            <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">About</span>
            <span className="text-4xl font-bold text-green-600 dark:text-green-500"> SayLess</span>
          </h1>
          <p className="text-gray-800 dark:text-gray-300 text-[20px] p-2 ">
            {" "}
            We're building the future of African connectivity. SayLess is more than just a chat app; it's a bridge that brings people together across any distance.
          </p>
        </div>
      </div>
      <div className="md:flex sm:flex-col justify-center items-center  w-full  mt-4 bg-white dark:bg-gray-900 transition-colors">
        <div className=" flex max-w-[1222px] flex-wrap">
          <div className="max-w-[610px] mx-auto px-2 py-8  flex flex-col gap-6">
            <h1 className=" font-bold text-gray-800 dark:text-white mb-2 text-[29px] ">
              {" "}
              Our Story
            </h1>
            <div>
              <p className="text-gray-800 dark:text-gray-300 mb-7 text-[19px]">
                SayLess was born from a simple observation: modern communication is often too complex and heavy. We wanted to create a tool that is lightning-fast, secure, and works on any browser without any installs.
              </p>
              <p className="text-gray-800 dark:text-gray-300 mb-7 text-[19px]">
                Our team combines world-class engineering with a deep understanding of local needs to build a platform that thrives even on low bandwidth, ensuring no one is left out of the digital conversation.
              </p>
              <p className="text-gray-800 dark:text-gray-300 mb-7 text-[19px]">
                What started as a simple idea has grown into a community of users who value privacy, speed, and simplicity. We're proud to be built in Nigeria, for the world.
              </p>

              <Link to="/signup">
                <button className="py-4 px-6 mt-10 text-[15.9px]  bg-green-600 dark:bg-green-700 text-white font-semibold rounded-lg  transition duration-300 flex items-center  cursor-pointer ">
                  Get Learn More About Us
                </button>
              </Link>
            </div>
          </div>

          {/* icons form here */}

          <div className="max-w-[610px] mx-auto px-4 py-8 flex flex-col flex-wrap gap-6">
            <h1 className=" font-bold text-gray-800 dark:text-white mb-2 text-[29px] ">
              Our Approach
            </h1>
            <div>
              <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className=" flex h-[200px] shadow-md w-[270px] flex-col hover:shadow-2xl rounded-lg py-4 px-8 bg-white dark:bg-gray-800 text-center transition
                duration-300 ease-in-out items-center"
                >
                  <BarChart2 className="w-14 h-14 text-green-600 dark:text-green-500 stroke-green-600 dark:stroke-green-500 transition-colors group-hover:stroke-white group-hover:bg-green-600 bg-green-100 dark:bg-green-900/30 p-2 rounded-md" />

                  <p className="text-green-600 dark:text-green-500 text-[30px] font-bold ">200+</p>
                  <p className="text-gray-800 dark:text-gray-200 p-2 text-[20px] font-bold ">
                    Satisfied Clients
                  </p>
                </div>
                <div
                  className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl rounded-lg py-4 px-8 bg-white dark:bg-gray-800 transition
                duration-300 ease-in-out text-center shadow-md items-center"
                >
                  <BarChart2 className="w-14 h-14 text-green-600 dark:text-green-500 stroke-green-600 dark:stroke-green-500 transition-colors group-hover:stroke-white group-hover:bg-green-600 bg-green-100 dark:bg-green-900/30 p-2 rounded-md" />

                  <p className="text-green-600 dark:text-green-500 text-[30px] font-bold ">50+</p>
                  <p className="text-gray-800 dark:text-gray-200 p-2 text-[20px] font-bold ">
                    Awards Won
                  </p>
                </div>

                <div
                  className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl transition
                duration-300 ease-in-out
                 rounded-lg py-4 px-8 bg-white dark:bg-gray-800 text-center shadow-md items-center"
                >
                  <Users className="w-14 h-14 text-green-600 dark:text-green-500 stroke-green-600 dark:stroke-green-500 transition-colors group-hover:stroke-white group-hover:bg-green-600 bg-green-100 dark:bg-green-900/30 p-2 rounded-md" />

                  <p className="text-green-600 dark:text-green-500 text-[30px] font-bold ">5+</p>
                  <p className="text-gray-800 dark:text-gray-200 p-2 text-[20px] font-bold ">
                    Years Experience
                  </p>
                </div>
                <div
                  className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl transition
                duration-300 ease-in-out
                 rounded-lg py-4 px-8 bg-white dark:bg-gray-800 text-center shadow-md items-center"
                >
                  <Users className="w-14 h-14 text-green-600 dark:text-green-500 stroke-green-600 dark:stroke-green-500 transition-colors group-hover:stroke-white group-hover:bg-green-600 bg-green-100 dark:bg-green-900/30 p-2 rounded-md" />

                  <p className="text-green-600 dark:text-green-500 text-[30px] font-bold ">500+</p>
                  <p className="text-gray-800 dark:text-gray-200 p-1 text-[20px] font-bold ">
                    Projects Completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* our values section */}

      <div className="bg-white dark:bg-gray-900 transition-colors">
        <div>
          <div>
            <h1 className="text-center text-[29px] font-bold text-gray-800 dark:text-white mb-6">
              Our Values
            </h1>
          </div>
          <div className="flex justify-center items-center flex-wrap gap-6 max-w-[1222px] mx-auto px-4 py-8">
            <div
              className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl rounded-lg py-4 px-8 bg-white dark:bg-gray-800 transition
                duration-300 ease-in-out text-center shadow-md items-center"
            >
              <p className="text-2xl font-bold text-black dark:text-white my-4">Speed</p>

              <p className="text-gray-800 dark:text-gray-300 p-3 text-[16px] flex-wrap-wrap ">
                Our app is optimized for lightning-fast message delivery, even on 2G networks.
              </p>
            </div>

            <div
              className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl rounded-lg py-4 px-8 bg-white dark:bg-gray-800 transition
                duration-300 ease-in-out text-center shadow-md items-center"
            >
              <p className="text-2xl font-bold text-black dark:text-white my-4">
                Security
              </p>

              <p className="text-gray-800 dark:text-gray-300 p-3 text-[16px] flex-wrap-wrap ">
                We use industry-standard encryption to ensure your private conversations stay private.
              </p>
            </div>

            <div
              className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl rounded-lg py-4 px-8 bg-white dark:bg-gray-800 transition
                duration-300 ease-in-out text-center shadow-md items-center"
            >
              <p className="text-2xl font-bold text-black dark:text-white my-4">
                Inclusivity
              </p>

              <p className="text-gray-800 dark:text-gray-300 p-3 text-[16px] flex-wrap-wrap ">
                Zero downloads means anyone with a browser can connect, regardless of device storage.
              </p>
            </div>

            <div
              className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl rounded-lg py-4 px-8 bg-white dark:bg-gray-800 transition
                duration-300 ease-in-out text-center shadow-md items-center"
            >
              <p className="text-2xl font-bold text-black dark:text-white my-4">Privacy</p>

              <p className="text-gray-800 dark:text-gray-300 p-3 text-[16px] flex-wrap-wrap ">
                We don't track your data or sell your information. Your chats belong only to you.
              </p>
            </div>

            <div className=" flex justify-center items-center  w-full  mt-4 bg-transparent ">
              <div className=" text-center py-6 w-[1222px]  bg-white dark:bg-gray-800 rounded-[19px] shadow-lg flex justify-center items-center flex-col mt-10 mb-6 transition-colors">
                <h1 className=" text-black dark:text-white font-bold text-[30px] mb-5">
                  Meet Our Expert Team
                </h1>
                <p className="text-gray-800 dark:text-gray-300 text-[20px] mx-auto max-w-[800px] mb-6">
                  Our diverse team of marketing professionals brings together
                  years of experience and fresh perspectives to deliver
                  exceptional results.
                </p>

                <Link to="/signup">
                  <button className="py-4 px-6 mt-4 text-[16px] bg-green-600 dark:bg-green-700 text-white font-semibold rounded-lg  transition duration-300 flex items-center space-x-2 cursor-pointer ">
                    View Team Profiles
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Contact />
    </div>
  );
};
