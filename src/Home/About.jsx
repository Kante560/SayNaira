import React from "react";
import { Megaphone, ArrowRight, BarChart2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Contact } from "../pages/Contact";
import { Users2 } from "lucide-react";
import { Nav } from "./Nav";


export const About = () => {
  return (
    <>
    <Nav />
      <div className="flex justify-center items-center  w-full  mt-8 bg-white">
        <div className="text-center max-w-[50rem] flex justify-center items-center flex-col mt-10 mb-6">
          <h1 className=" font-bold text-gray-800 mb-6 ">
            <span className="text-4xl font-bold text-gray-800 ">About</span>
            <span className="text-4xl font-bold text-green-600"> SayLess</span>
          </h1>
          <p className="text-gray-800 text-[20px] p-2 ">
            {" "}
            We're passionate about transforming marketing thoughts into
            profitable realities. Every naira you invest with us is
            strategically deployed for maximum impact.
          </p>
        </div>
      </div>
      <div className="md:flex sm:flex-col justify-center items-center  w-full  mt-4 bg-white  ">
        <div className=" flex max-w-[1222px] flex-wrap">
          <div className="max-w-[610px] mx-auto px-2 py-8  flex flex-col gap-6">
            <h1 className=" font-bold text-gray-800 mb-2 text-[29px] ">
              {" "}
              Our Story
            </h1>
            <div>
              <p className="text-gray-800 mb-7 text-[19px]">
                Founded with the vision of making every marketing naira count,
                SayLess emerged from the understanding that great marketing
                thoughts need expert execution to become reality.
              </p>
              <p className="text-gray-800 mb-7 text-[19px]">
                Our team combines deep marketing expertise with innovative
                thinking to help businesses of all sizes achieve their growth
                objectives. We believe that with the right strategy, every
                business can thrive in today's competitive landscape.
              </p>
              <p className="text-gray-800 mb-7 text-[19px]">
                From startups to established enterprises, we've helped countless
                organizations transform their marketing approach and achieve
                remarkable results that speak for themselves.
              </p>

              <Link to="/Learn More">
                <button className="py-4 px-6 mt-10 text-[15.9px]  bg-green-600 text-white font-semibold rounded-lg  transition duration-300 flex items-center  cursor-pointer ">
                  Get Learn More About Us
                </button>
              </Link>
            </div>
          </div>

          {/* icons form here */}

          <div className="max-w-[610px] mx-auto px-4 py-8 flex flex-col flex-wrap gap-6">
            <h1 className=" font-bold text-gray-800 mb-2 text-[29px] ">
              Our Approach
            </h1>
            <div>
              <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className=" flex h-[200px] shadow-md w-[270px] flex-col hover:shadow-2xl rounded-lg py-4 px-8 bg-white text-center transition
                duration-300 ease-in-out items-center"
                >
                  <BarChart2 className="w-14 h-14 text-green-600 stroke-green-600 transition-colors group-hover:stroke-white group-hover:bg-green-600 bg-green-100 p-2 rounded-md" />

                  <p className="text-green-600  text-[30px] font-bold ">200+</p>
                  <p className="text-gray-800 p-2 text-[20px] font-bold ">
                    Satisfied Clients
                  </p>
                </div>
                <div
                  className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl rounded-lg py-4 px-8 bg-white transition
                duration-300 ease-in-out text-center shadow-md items-center"
                >
                  <BarChart2 className="w-14 h-14 text-green-600 stroke-green-600 transition-colors group-hover:stroke-white group-hover:bg-green-600 bg-green-100 p-2 rounded-md" />

                  <p className="text-green-600 text-[30px] font-bold ">50+</p>
                  <p className="text-gray-800 p-2 text-[20px] font-bold ">
                    Awards Won
                  </p>
                </div>

                <div
                  className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl transition
                duration-300 ease-in-out
                 rounded-lg py-4 px-8 bg-white text-center shadow-md items-center"
                >
                  <Users className="w-14 h-14 text-green-600 stroke-green-600 transition-colors group-hover:stroke-white group-hover:bg-green-600 bg-green-100 p-2 rounded-md" />

                  <p className="text-green-600  text-[30px] font-bold ">5+</p>
                  <p className="text-gray-800 p-2 text-[20px] font-bold ">
                    Years Experience
                  </p>
                </div>
                <div
                  className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl transition
                duration-300 ease-in-out
                 rounded-lg py-4 px-8 bg-white text-center shadow-md items-center"
                >
                  <Users className="w-14 h-14 text-green-600 stroke-green-600 transition-colors group-hover:stroke-white group-hover:bg-green-600 bg-green-100 p-2 rounded-md" />

                  <p className="text-green-600  text-[30px] font-bold ">500+</p>
                  <p className="text-gray-800 p-1 text-[20px] font-bold ">
                    Projects Completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* our values section */}

      <div>
        <div>
          <div>
            <h1 className="text-center text-[29px] font-bold text-gray-800 mb-6">
              Our Values
            </h1>
          </div>
          <div className="flex justify-center items-center flex-wrap gap-6 max-w-[1222px] mx-auto px-4 py-8">
            <div
              className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl rounded-lg py-4 px-8 bg-white transition
                duration-300 ease-in-out text-center shadow-md items-center"
            >
              <p className="text-2xl font-bold text-black my-4">Innovation</p>

              <p className="text-gray-800 p-3 text-[16px] flex-wrap-wrap ">
                We stay ahead of marketing trends and technologies to deliver
                cutting-edge solutions.
              </p>
            </div>

            <div
              className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl rounded-lg py-4 px-8 bg-white transition
                duration-300 ease-in-out text-center shadow-md items-center"
            >
              <p className="text-2xl font-bold text-black my-4">
                Results-Driven
              </p>

              <p className="text-gray-800 p-3 text-[16px] flex-wrap-wrap ">
                Every strategy is designed with measurable outcomes and ROI in
                mind.
              </p>
            </div>

            <div
              className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl rounded-lg py-4 px-8 bg-white transition
                duration-300 ease-in-out text-center shadow-md items-center"
            >
              <p className="text-2xl font-bold text-black my-4">
                Client-Focused
              </p>

              <p className="text-gray-800 p-3 text-[16px] flex-wrap-wrap ">
                Your success is our priority. We build long-term partnerships,
                not just projects.
              </p>
            </div>

            <div
              className=" flex h-[200px] w-[270px] flex-col hover:shadow-2xl rounded-lg py-4 px-8 bg-white transition
                duration-300 ease-in-out text-center shadow-md items-center"
            >
              <p className="text-2xl font-bold text-black my-4">Transparency</p>

              <p className="text-gray-800 p-3 text-[16px] flex-wrap-wrap ">
                Clear communication and honest reporting at every step of our
                collaboration.
              </p>
            </div>

            <div className=" flex justify-center items-center  w-full  mt-4 bg-transparent ">
              <div className=" text-center py-6 w-[1222px]  bg-white rounded-[19px] shadow-lg flex justify-center items-center flex-col mt-10 mb-6">
                <h1 className=" text-black font-bold text-[30px] mb-5">
                  Meet Our Expert Team
                </h1>
                <p className="text-gray-800 text-[20px] mx-auto max-w-[800px] mb-6">
                  Our diverse team of marketing professionals brings together
                  years of experience and fresh perspectives to deliver
                  exceptional results.
                </p>

                <Link to="/signup">
                  <button className="py-4 px-6 mt-4 text-[16px] bg-green-600 text-white font-semibold rounded-lg  transition duration-300 flex items-center space-x-2 cursor-pointer ">
                    View Team Profiles
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Contact />
    </>
  );
};
