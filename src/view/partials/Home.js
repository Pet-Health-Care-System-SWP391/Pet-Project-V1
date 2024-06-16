<<<<<<< HEAD
import React, { useEffect, useState, useRef } from "react";
import { auth } from "../../Components/firebase/firebase"; // Assuming you have a firebase config file
import { useNavigate } from "react-router-dom";
import Typed from "typed.js"; // Import Typed.js directly
import { ToastContainer, toast } from "react-toastify";
import emailjs from "emailjs-com";
import ScrollReveal from "scrollreveal";
import { faPaw } from "@fortawesome/free-solid-svg-icons";
import Aos from "aos";
import "aos/dist/aos.css";
import "react-toastify/dist/ReactToastify.css";
import {
  faFacebook,
  faInstagram,
  faTiktok,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useForceUpdate from "../../hooks/useForceUpdate";
import { getDatabase, get, ref } from "firebase/database";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
// import Swiper and modules styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function Home() {
  const typedElement = useRef(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const form = useRef();
  const [userName, setUserName] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 6;
  const [backgroundImage, setBackgroundImage] = useState("");
  const forceUpdate = useForceUpdate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  useEffect(() => {
    const currentImage = document.querySelector(
      `.list-images .slide:nth-child(${currentSlide + 1}) img`
    );
    if (currentImage) {
      setBackgroundImage(currentImage.src);
    }
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  };

  const currentSlideHandler = (n) => {
    setCurrentSlide(n - 1);
  };

  useEffect(() => {
    Aos.init({
      duration: 1000,
      easing: "ease",
      once: true,
    });
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const book = () => {
    if (user) {
      navigate("/book/select-pet");
    } else {
      navigate("/signIn");
      toast.error("Please log in first to continue your booking!", {
        autoClose: 2000,
        onClose: () => {
          forceUpdate();
        },
      });
    }
  };

  const sendEmail = (e) => {
    e.preventDefault();
    const formData = new FormData(form.current);
    formData.append("to_name", userName);
    emailjs
      .sendForm(
        "service_9sprp0p",
        "template_pz8ey59",
        form.current,
        "gWym0COHJFeyRWp5M"
      )
      .then(
        (result) => {
          console.log(result.text);
          toast.success("Email sent successfully!", {
            autoClose: 2000,
            onClose: () => {
              forceUpdate();
            },
          });
        },
        (error) => {
          console.log(error.text);
          toast.error("Failed to send email.", {
            autoClose: 2000,
            onClose: () => {
              forceUpdate();
            },
          });
        }
      );

    e.target.reset();
  };

  useEffect(() => {
    const options = {
      strings: ["Grooming", "Healthcare", "Daycare", "Bathing"],
      typeSpeed: 50,
      backSpeed: 50,
      backDelay: 400,
      loop: true,
    };

    const typed = new Typed(typedElement.current, options);

    return () => {
      typed.destroy();
    };
  }, []);

  useEffect(() => {
    ScrollReveal().reveal(".home-content, .heading", {
      origin: "top",
      distance: "80px",
      duration: 2000,
      delay: 200,
    });
    ScrollReveal().reveal(
      ".home-img, .services-container, .portfolio-box, .contact form",
      { origin: "bottom", distance: "80px", duration: 2000, delay: 200 }
    );
    ScrollReveal().reveal(".home-container h1, .about-img", {
      origin: "left",
      distance: "80px",
      duration: 2000,
      delay: 200,
    });
    ScrollReveal().reveal(".home-container p, .about-content", {
      origin: "right",
      distance: "80px",
      duration: 2000,
      delay: 200,
    });
  }, []);
  const homePage = () => {
    if (dropdownOpen) {
      setDropdownOpen(false); // Close dropdown if open
    }
    navigate("/#home");
  };
  useEffect(() => {
    const fetchAllBookings = async () => {
      const db = getDatabase();
      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);
      const usersData = snapshot.val();
      let allBookings = [];
      console.log("Users Data:", usersData); // Log to check usersData

      if (usersData) {
        Object.keys(usersData).forEach((userId) => {
          const userData = usersData[userId];
          if (userData.bookings) {
            Object.keys(userData.bookings).forEach((bookingId) => {
              const booking = userData.bookings[bookingId];
              allBookings.push({
                userId,
                bookingId,
                ...booking,
              });
            });
          }
        });
      }
      console.log("All Bookings:", allBookings);
      setBookedSlots(allBookings);
    };

    fetchAllBookings();
  }, []);
  

  const renderRatedBookings = () => {
    const ratedBookings = bookedSlots.filter(
      (booking) => booking.status === "Rated" && booking.rating > 3
    );

    return ratedBookings.map((booking) => (
      <div key={booking.bookingId}>
        <div className="testimonial-box">
          <img
            className="testimonial-avatar"
            src={`${booking.pet.imageUrl}`}
            alt="User Avatar"
          />
          <div className="testimonial-content">
            <div style={{
              fontSize: "3rem",
              color: "var(--text-color)"
            }}>

          Rating:
            </div>
           <Box
          
                      sx={{
                        marginTop: "12px",
                        width: 200,
                        display: "flex",
                        alignItems: "center",
                        float: "right",
                      }}
                    >
                       <Box sx={{ ml: 2, fontSize: "2rem", marginRight: "12px" }}>{booking.rating.toFixed(1)}</Box>
                      <Rating
                        name="read-only"
                        value={booking.rating}
                        readOnly
                        sx={{
                          "& .MuiRating-iconFilled": {
                            color: "gold",
                          },
                        }}
                      />
                    </Box>
            <p className="testimonial-text">
           <div>
           <div style={{
              fontSize: "3rem",
              color: "var(--text-color)",
              marginBottom: "20px"
            }}>

          Review:
            </div>
              {booking.review}
              </div>
            </p>
            <p className="testimonial-signature">{booking.username}, {booking.pet.name} </p>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div>
      <div id="root">
        <section className="home-section" id="home">
          <div className="home-content">
            <h3>Welcome to PetCenter</h3>
            <h1>Your One-Stop Solution for Pet Care</h1>
            <h3>
              We Provide{" "}
              <span ref={typedElement} className="multiple-text"></span> Service
            </h3>
            <p>
              At PetCenter, we enhance the lives of pets and their owners with a
              wide range of services. From grooming and veterinary care to
              training and daycare, we're here to support you and your furry
              friends.
            </p>
            <a onClick={book} className="btn">
              Book now
            </a>
          </div>
          <div className="home-img">
            <img
              src="https://static.wixstatic.com/media/84770f_cc7fbf222d044cf09028f921a0cfe36e~mv2.png/v1/crop/x_0,y_0,w_5002,h_3009/fill/w_1163,h_699,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/shutterstock_184908566%20copy.png"
              alt=""
              width="2400"
              height="559"
              srcset="https://static.wixstatic.com/media/84770f_cc7fbf222d044cf09028f921a0cfe36e~mv2.png/v1/crop/x_0,y_0,w_5002,h_3009/fill/w_1163,h_699,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/shutterstock_184908566%20copy.png"
              fetchpriority="high"
            ></img>
          </div>
        </section>
      </div>
      <section className="about" id="about">
        <div className="font_0" data-aos="fade-in">
          <h3>Hi, I'm Dr. Mark Edwards</h3>
        </div>

        <div className="about-container">
          <div className="about-image" data-aos="fade-right">
            <img
              className="img-about"
              src="https://static.wixstatic.com/media/84770f_ec1b885cde544df1bf299c3d35749700~mv2_d_3848_3848_s_4_2.jpg/v1/fill/w_513,h_513,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/84770f_ec1b885cde544df1bf299c3d35749700~mv2_d_3848_3848_s_4_2.jpg"
              alt=""
              width="410"
              height="410"
              srcset="https://static.wixstatic.com/media/84770f_ec1b885cde544df1bf299c3d35749700~mv2_d_3848_3848_s_4_2.jpg/v1/fill/w_513,h_513,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/84770f_ec1b885cde544df1bf299c3d35749700~mv2_d_3848_3848_s_4_2.jpg"
              fetchpriority="high"
            ></img>
          </div>
          <div className="about-text" data-aos="fade-left">
            <span className="text-about">
              Over 16 Years of Veterinary Experience
            </span>
            <p className="font_1">
              <span className="text1-about">
                With over 16 years of experience working in the field of
                veterinary medicine, I am a passionate veterinarian with a deep
                understanding of the health and happiness of pet animals. I
                graduated from Hanoi National University School of Medicine and
                have worked at many reputable veterinary clinics and veterinary
                hospitals throughout the area. Through thousands of animal
                treatment and care cases, I have accumulated valuable experience
                and diverse professional skills. I am always dedicated and
                dedicated to caring for each patient, along with dedicated
                understanding and advice to owners on how to care for and
                protect their pets' health.
              </span>
            </p>
          </div>
        </div>
        <div className="about-container">
          <div className="about-text2" data-aos="fade-right">
            <span className="text-about">
              Over 16 Years of Veterinary Experience
            </span>
            <p className="font_1">
              <span className="text1-about">
                In addition to my daily work, I also regularly participate in
                community education activities to share my knowledge and
                experience with the community, while creating high awareness of
                health issues and disease prevention for people. animal. My
                mission is to bring peace and happiness to every family through
                health care for their pets. With enthusiasm and extensive
                knowledge, I am committed to continuing to contribute to the
                development of the field of veterinary medicine and bring the
                best care services to the community.
              </span>
            </p>
          </div>
          <div className="about-image2" data-aos="fade-left">
            <img
              className="img-about"
              src="https://static.wixstatic.com/media/84770f_e57bb42011fe4e91992f1ceeece2a7b3~mv2_d_4000_3947_s_4_2.jpg/v1/fill/w_526,h_519,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/84770f_e57bb42011fe4e91992f1ceeece2a7b3~mv2_d_4000_3947_s_4_2.jpg"
              fetchpriority="high"
            ></img>
          </div>
        </div>
        <div className="font_2" data-aos="zoom-in-up">
          <h3>What Our Happy Clients Say</h3>
        </div>
        <div>
      <div className="testimonial-container" data-aos="fade-up">
        <Swiper
          spaceBetween={50}
          slidesPerView={4}
          loop={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
        >
          {renderRatedBookings().map((slideContent, index) => (
            <SwiperSlide key={index}>{slideContent}</SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
      </section>
      <section className="services" id="services">
        <div className="font_3" data-aos="zoom-in-down">
          <h3 style={{ marginTop: "68px" }}>
            Your pet deserves to be pampered!
          </h3>
        </div>
        <div class="big-line"></div>

        <div class="card-container">
          <div class="card" data-aos="fade-right" onClick={book}>
            <h2>GROOMING</h2>

            <p>
              This service includes bathing, hair cutting and eye cleaning,
              combing, and skin examinations, requiring the groomer to
              understand the pet's temperament.
            </p>
            <img
              class="card-avatar"
              src="https://bpanimalhospital.com/wp-content/uploads/shutterstock_1547371985.jpg"
              alt="User Avatar"
            />
            <div class="pricing">30 min: $21.00 | 60 min: $36.00</div>
          </div>
          <div class="card" data-aos="fade-up" onClick={book}>
            <h2>CHECK UP</h2>

            <p>
              This service involves a comprehensive physical examination of the
              pet's body, including measurements of temperature, blood pressure,
              heart rate and weight
            </p>
            <img
              class="card-avatar"
              src="https://www.cherrycreekvet.com/blog/wp-content/uploads/2024/03/iStock-1445008380-3-1-2000x1333.jpg"
              alt="User Avatar"
            />
            <div class="pricing">$50.00</div>
          </div>
          <div class="card" data-aos="fade-left" onClick={book}>
            <h2>Vaccination</h2>

            <p>
              Pet immunizations are crucial for preventative pet healthcare,
              protecting against harmful illnesses, and are widely discussed
              among veterinarians and pet owners
            </p>
            <img
              class="card-avatar"
              src="https://media.istockphoto.com/id/966384466/vi/anh/c%E1%BA%AFt-h%C3%ACnh-%E1%BA%A3nh-ng%C6%B0%E1%BB%9Di-%C4%91%C3%A0n-%C3%B4ng-c%E1%BA%A7m-beagle-trong-khi-b%C3%A1c-s%C4%A9-th%C3%BA-y-ti%C3%AAm-b%E1%BA%B1ng-%E1%BB%91ng-ti%C3%AAm-v%C3%A0o-n%C3%B3.jpg?s=612x612&w=0&k=20&c=ViUs_0PoS5B26q7ScYHNx21sj8hMlcburn_H_aREbSM="
              alt="User Avatar"
            />
            <div class="pricing">$36.00</div>
          </div>
          <div class="card" data-aos="fade-right" onClick={book}>
            <h2>PET VETERINARY</h2>

            <p>
              This service offers complete medical care for animals, including
              the identification and management of diseases, traumas, and other
              health issues.
            </p>
            <img
              class="card-avatar"
              src="https://media.istockphoto.com/id/1171733307/vi/anh/b%C3%A1c-s%C4%A9-th%C3%BA-y-v%E1%BB%9Bi-ch%C3%B3-v%C3%A0-m%C3%A8o-ch%C3%B3-con-v%C3%A0-m%C3%A8o-con-t%E1%BA%A1i-b%C3%A1c-s%C4%A9.jpg?s=612x612&w=0&k=20&c=eZRCsHMznU16Nr89IkT6ETLH3Enzt9TwBUx4mIxZhzE="
              alt="User Avatar"
            />
            <div class="pricing">30 min: $21.00 | 60 min: $36.00</div>
          </div>
        </div>
        <div className="font_4" data-aos="flip-up">
          <h3>Pet Moment!</h3>
        </div>
        <div class="big-line"></div>
        <div className="slide-show-container">
          <div
            className="slide-show-background"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          ></div>
          <div className="slide-show">
            <div
              className="list-images"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              <div className="slide">
                <div className="image-wrapper">
                  <img src="https://thuythithi.com/wp-content/uploads/2020/03/tim-bac-si-thu-y-uy-tin-chua-benh-cho-cho-meo-tai-tp-hcm.jpg"></img>
                </div>
              </div>
              <div className="slide">
                <div className="image-wrapper">
                  <img src="https://thuythithi.com/wp-content/uploads/2020/03/doi-ngay-bac-si-thu-y-khi-thay-nhung-dau-hieu-sau-de-thu-cung-cua-ban-luon-khoe-manh.jpg"></img>
                </div>
              </div>
              <div className="slide">
                <div className="image-wrapper">
                  <img src="https://media.istockphoto.com/id/1371820919/vi/anh/y-t%C3%A1-tr%E1%BA%BB-nh%C3%ACn-labrador.jpg?s=612x612&w=0&k=20&c=FMAM4UXefhcSVe82TTvMNEh8HtR7hIUjshzEK4e5Hd4="></img>
                </div>
              </div>
              <div className="slide">
                <div className="image-wrapper">
                  <img src="https://ttol.vietnamnetjsc.vn/images/2019/01/27/21/51/photo-1-15485795786021781044006.jpg"></img>
                </div>
              </div>
              <div className="slide">
                <div className="image-wrapper">
                  <img src="https://media.istockphoto.com/id/1044460686/vi/anh/b%C3%A1c-s%C4%A9-s%E1%BB%AD-d%E1%BB%A5ng-%E1%BB%91ng-nghe-tr%C3%AAn-m%E1%BB%99t-con.jpg?s=612x612&w=0&k=20&c=gbP097Z9ZDOzN2v_a7SVAmDYO2aZsGKmsRf5wCyHkHo="></img>
                </div>
              </div>
              <div className="slide">
                <div className="image-wrapper">
                  <img src="https://media.istockphoto.com/id/1303833920/vi/anh/nam-b%C3%A1c-s%C4%A9-th%C3%BA-y-ki%E1%BB%83m-tra-ch%C3%B3-t%E1%BA%A1i-ph%C3%B2ng-kh%C3%A1m-th%C3%BA-y.jpg?s=612x612&w=0&k=20&c=JpWoIV99ZHVm-jLZn_p2rSlSQ0MPqdQzB-QmXAmwnjQ="></img>
                </div>
              </div>
            </div>
            <div className="button-slide">
              <button className="prev" onClick={prevSlide}>
                &#10094;
              </button>
              <button className="next" onClick={nextSlide}>
                &#10095;
              </button>
            </div>
            <div className="dot-container">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentSlide ? "active" : ""}`}
                  onClick={() => currentSlideHandler(index)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="contact" id="contact">
        <div className="question">
          <img
            src="https://static.wixstatic.com/media/84770f_346b425b1fe54554a98a4425fa8333cb~mv2_d_3760_3760_s_4_2.jpg/v1/fill/w_599,h_599,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/84770f_346b425b1fe54554a98a4425fa8333cb~mv2_d_3760_3760_s_4_2.jpg"
            alt=""
            class="round-image"
            style={{
              width: "179px",
              height: "178px",
              objectFit: "fill",
              marginLeft: "-200px",
            }}
            width="479"
            height="478"
            srcSet="https://static.wixstatic.com/media/84770f_346b425b1fe54554a98a4425fa8333cb~mv2_d_3760_3760_s_4_2.jpg/v1/fill/w_599,h_599,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/84770f_346b425b1fe54554a98a4425fa8333cb~mv2_d_3760_3760_s_4_2.jpg"
            fetchPriority="high"
          />
          <div className="quick-question" data-aos="flip-left">
            <p className="quick-question1">
              1. Has your pet had problems with eating recently?
            </p>
            <p className="quick-answer1">
              Yes, my pets have changed their food intake, they don't eat it all
              like before.
            </p>
            <p className="quick-question2">
              2. Does the pet show any abnormalities in behavior or health?
            </p>
            <p className="quick-answer1">
              Yes, my pet has been vomiting and showing signs of fatigue for the
              past few days.
            </p>
            <p className="quick-question3">
              3. Has your pet had any problems recently?{" "}
            </p>
            <p className="quick-answer1">
              No, my pet has not had any problems recently.
            </p>
          </div>
          <img
            className="image-70"
            src="https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6353420dafc1661ee0ee3b4e_pet%20insurance%20(2).png"
            alt="Petotum"
            style={{
              opacity: 1,
              transform:
                "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
              transformStyle: "preserve-3d",
            }}
            sizes="(max-width: 479px) 100vw, (max-width: 767px) 83vw, (max-width: 991px) 85vw, (max-width: 1600px) 45vw, 1000px"
            data-w-id="abefafda-0c43-e7a4-fa4b-7ff2c7fd5cc9"
            loading="lazy"
            srcSet="https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6353420dafc1661ee0ee3b4e_pet%20insurance%20(2)-p-500.png 500w, https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6353420dafc1661ee0ee3b4e_pet%20insurance%20(2)-p-800.png 800w, https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6353420dafc1661ee0ee3b4e_pet%20insurance%20(2)-p-1080.png 1080w, https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6353420dafc1661ee0ee3b4e_pet%20insurance%20(2)-p-1600.png 1600w, https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6353420dafc1661ee0ee3b4e_pet%20insurance%20(2)-p-2000.png 2000w, https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6353420dafc1661ee0ee3b4e_pet%20insurance%20(2).png 2880w"
          />
        </div>
        <div className="form-contact" data-aos="flip-right">
          <h2 className="heading">
            Contact <span className="us">Us!</span>
          </h2>
          <form ref={form} onSubmit={sendEmail}>
            <div className="input-box">
              <input
                type="text"
                name="from_name"
                placeholder="Full Name"
                required
              />
              <input
                type="email"
                name="from_email"
                placeholder="Email Address"
                required
              />
            </div>
            <div className="input-box">
              <input
                type="number"
                name="from_phone"
                placeholder="Mobile Number"
                required
              />
              <input
                type="text"
                name="subject"
                placeholder="Your Address"
                required
              />
            </div>
            <textarea
              name="message"
              cols="30"
              rows="10"
              placeholder="Your Message"
              required
            ></textarea>
            <input type="submit" value="Send Message" className="btn" />
          </form>
        </div>
      </section>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <a
              href="#home"
              onClick={homePage}
              className="logo"
              style={{ textDecoration: "none", color: "#7b2cbf" }}
            >
              <FontAwesomeIcon icon={faPaw} /> Pet Center
            </a>
            <div className="footer-info">
              <p>Address: Nha Van Hoa Sinh Vien Lang Dai Hoc Thu Duc</p>
              <p>Hotline: 0762 029 029</p>
              <p>Email: xxxxx@hotmail.com</p>
            </div>
            <div className="footer-title">
              Continuously improve service quality and level of expertise
              Bringing customers the most perfect services...
            </div>
            <div className="footer-social">
              <a href="#" className="social-icon">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="#" className="social-icon">
                <FontAwesomeIcon icon={faTiktok} />
              </a>
              <a href="#" className="social-icon">
                <FontAwesomeIcon icon={faYoutube} />
              </a>
              <a href="#" className="social-icon">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </div>
          </div>
          <div className="footer-section footer-map">
            <h3>Bản Đồ</h3>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.1640561676095!2d106.79814847609639!3d10.875123789279707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d8a6b19d6763%3A0x143c54525028b2e!2zTmjDoCBWxINuIGjDs2EgU2luaCB2acOqbiBUUC5IQ00!5e0!3m2!1svi!2s!4v1715862724373!5m2!1svi!2s"
              width="400"
              height="350"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
=======
import React, { useEffect, useState, useRef } from "react";
import { auth } from "../../Components/firebase/firebase"; // Assuming you have a firebase config file
import { useNavigate } from "react-router-dom";
import { Typed } from "react-typed";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import emailjs from "emailjs-com";

function Home() {
  const typedElement = useRef(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const form = useRef();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập của người dùng khi component được tải
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user); // Đặt trạng thái người dùng nếu đã đăng nhập
      } else {
        setUser(null); // Đặt trạng thái người dùng là null nếu chưa đăng nhập
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const book = () => {
    if (user) {
      navigate("/book");
    } else {
      navigate("/signIn");
      toast.error("Please log in first to continue your booking!");
    }
  };

  const sendEmail = (e) => {
    e.preventDefault();
    const formData = new FormData(form.current);
    formData.append("to_name", userName);
    emailjs
      .sendForm(
        "service_9sprp0p",
        "template_pz8ey59",
        form.current,
        "gWym0COHJFeyRWp5M"
      )
      .then(
        (result) => {
          console.log(result.text);
          toast.success("Email sent successfully!");
        },
        (error) => {
          console.log(error.text);
          toast.error("Failed to send email.");
        }
      );

    e.target.reset();
  };

  useEffect(() => {
    const options = {
      strings: ["Grooming", "Healthcare", "Daycare", "Training"],
      typeSpeed: 50,
      backSpeed: 50,
      backDelay: 400,
      loop: true,
    };

    const typed = new Typed(typedElement.current, options);

    // Cleanup function to destroy Typed instance on component unmount
    return () => {
      typed.destroy();
    };
  }, []);
  return (
    <div>
      <div id="root">
        <section className="home-section" id="home">
          <div className="home-content">
            <h3>Welcome to PetCenter</h3>
            <h1>Your One-Stop Solution for Pet Care</h1>
            <h3>
              We Provide{" "}
              <span ref={typedElement} className="multiple-text"></span> Service
            </h3>
            <p>
              At PetCenter, we enhance the lives of pets and their owners with a
              wide range of services. From grooming and veterinary care to
              training and daycare, we're here to support you and your furry
              friends.
            </p>
            <a onClick={book} className="btn">
              Book now
            </a>
          </div>
          <div className="home-img">
            <img src="https://scontent.fsgn2-6.fna.fbcdn.net/v/t39.30808-6/440942530_423620990437817_5689570377664203254_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=5f2048&_nc_ohc=BFrjCE_IQ8AQ7kNvgHNUkAr&_nc_ht=scontent.fsgn2-6.fna&oh=00_AYAE-6ge9dx5ooH4pzNnSfurgsz5i8tv1ymwOloTS8-CyQ&oe=66576FD2" />
          </div>
        </section>
      </div>
      <section className="about" id="about">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.1640561676095!2d106.79814847609639!3d10.875123789279707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d8a6b19d6763%3A0x143c54525028b2e!2zTmjDoCBWxINuIGjDs2EgU2luaCB2acOqbiBUUC5IQ00!5e0!3m2!1svi!2s!4v1715862724373!5m2!1svi!2s"
          width="600"
          height="450"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
      <section className="contact" id="contact">
        <h2 className="heading">
          Contact <span>Us!</span>
        </h2>
        <form ref={form} onSubmit={sendEmail}>
          <div className="input-box">
            <input
              type="text"
              name="from_name"
              placeholder="Full Name"
              required
            />
            <input
              type="email"
              name="from_email"
              placeholder="Email Address"
              required
            />
          </div>
          <div className="input-box">
            <input
              type="number"
              name="from_phone"
              placeholder="Mobile Number"
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Your Address"
              required
            />
          </div>
          <textarea
            name="message"
            cols="30"
            rows="10"
            placeholder="Your Message"
            required
          ></textarea>
          <input type="submit" value="Send Message" className="btn" />
        </form>
      </section>
    </div>
  );
}

export default Home;
>>>>>>> myrepo/main
