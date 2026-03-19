import { Link } from "react-router-dom";
import { Github, Mail, Heart, Twitter, Linkedin, Facebook } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark pt-16 pb-8 border-t border-brand-border">
      <div className="wrapper">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 group mb-6">
              <img
                src="/logo.png"
                alt="SkillFlare Logo"
                className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,107,53,0.5)]"
              />
              <span className="font-display font-bold text-xl tracking-tight text-white">
                SkillFlare
              </span>
            </Link>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              MITS SkillFlare connects students and teachers to create a
              thriving ecosystem of learning, collaboration, and growth.
            </p>
            
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-display font-bold text-lg text-white mb-6">
              Platform
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Browse Tasks", to: "/browse" },
                { label: "How it Works", to: "/#how-it-works" },
                { label: "Leaderboard", to: "/leaderboard" },
                { label: "Teacher Portal", to: "/login" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-brand-orange transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-lg text-white mb-6">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-gray-400">
                <Mail size={20} className="mt-1 text-brand-orange" />
                <span>
                  dargarkrish@gmail.com
                  <br />

                </span>
              </li>
              <li className="text-gray-500 text-sm">
                MITS Gwalior,
                <br />
                Race Course Road, Gwalior (M.P.)
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-brand-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} MITS SkillFlare. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="#" className="text-xs text-gray-500 hover:text-white">
              Privacy Policy
            </Link>
            <Link to="#" className="text-xs text-gray-500 hover:text-white">
              Terms of Service
            </Link>
            <p className="flex items-center text-gray-500 text-sm pl-4 border-l border-brand-border">
              Made with{" "}
              <Heart size={14} className="mx-1 text-red-500 fill-red-500" /> by
              MITS Students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
