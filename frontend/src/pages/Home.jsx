import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Award,
  Users,
  Briefcase,
  Star,
  Zap,
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const stats = [
    { label: 'Active Students', value: '500+', icon: Users },
    { label: 'Teachers', value: '50+', icon: Award },
    { label: 'Tasks Completed', value: '1.2k+', icon: CheckCircle },
    { label: 'Credits Earned', value: '25k+', icon: Zap },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-brand-dark">
        <div className="absolute inset-0 bg-hero-glow opacity-60"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-orange/20 blur-[120px] rounded-full"></div>
        
        <div className="wrapper relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-orange text-sm font-medium">
              <Zap size={16} />
              <span>For MITS Students & Teachers</span>
            </div>
            
            <h1 className="heading-hero">
              <span className="block text-white">#LEVEL UP</span>
              <span className="block text-gray-400">YOUR SKILLS WITH</span>
              <span className="block text-brand-orange tracking-widest">SkillFlare</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
              Join the MITS community talent marketplace. Complete tasks, 
              earn credits, and build your professional portfolio while you study.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary px-8 py-4 text-lg shadow-glow">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/browse" className="btn-secondary px-8 py-4 text-lg">
                Browse Tasks
              </Link>
            </div>

          </div>

          <div className="relative hidden lg:block animate-float">
            <div className="relative z-10 grid grid-cols-2 gap-6">
              <div className="space-y-6 pt-12">
                 {/* Card 1 */}
                 <div className="bg-brand-card p-6 rounded-3xl border border-brand-border shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-500">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center mb-4">
                       <Briefcase size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Teacher Tasks</h3>
                    <p className="text-gray-400 text-sm mb-4">Earn academic credits by helping professors.</p>
                    <div className="h-2 w-2/3 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-3/4"></div>
                    </div>
                 </div>
                 
                 {/* Card 2 */}
                 <div className="bg-brand-card p-6 rounded-3xl border border-brand-border shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-500 bg-gradient-to-br from-brand-card to-brand-surface">
                    <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center mb-4">
                       <Users size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Student Tasks</h3>
                    <p className="text-gray-400 text-sm">Collaborate with peers on side projects.</p>
                 </div>
              </div>
              
              <div className="space-y-6">
                {/* Card 3 */}
                <div className="bg-brand-orange p-6 rounded-3xl shadow-glow skew-y-3 transform hover:skew-y-0 transition-transform duration-500">
                   <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-4">
                      <Star size={24} fill="currentColor" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Skill Showcase</h3>
                   <p className="text-white/80 text-sm">Get noticed by top recruiters.</p>
                </div>

                {/* Card 4 */}
                <div className="bg-brand-card p-6 rounded-3xl border border-brand-border shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-500">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                         <CheckCircle size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-white">Task Completed</p>
                        <p className="text-xs text-gray-400">+20 Credits</p>
                      </div>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Python Script</span>
                      <span className="font-mono text-green-400">DONE</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Task Types */}
      <section className="py-24 bg-brand-surface relative overflow-hidden">
        <div className="wrapper relative z-10">
          <div className="mb-16">
            <h2 className="text-4xl font-display font-bold text-white mb-4">Our Tasks</h2>
            <p className="text-gray-400 max-w-xl text-lg">
              Unlock different opportunities based on your goals. Whether you want credits, portfolio pieces, or networking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group relative bg-[#2a2a2e] rounded-[32px] p-8 transition-transform hover:-translate-y-2">
               <div className="absolute top-8 right-8 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-brand-orange group-hover:border-brand-orange transition-colors">
                  <ArrowRight className="text-white -rotate-45 group-hover:rotate-0 transition-transform" />
               </div>
               <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center text-white font-bold mb-6">T</div>
               <h3 className="text-2xl font-bold text-white mb-2">Teacher Tasks</h3>
               <p className="text-brand-orange text-sm font-medium mb-4">Earn Credits</p>
               <p className="text-gray-400 leading-relaxed mb-8">
                 Complete tasks posted by teachers and earn credit points for your academic record.
               </p>
               <div className="bg-brand-dark/50 rounded-2xl h-48 w-full flex items-center justify-center border border-white/5">
                  <Briefcase className="w-16 h-16 text-gray-600" />
               </div>
            </div>

            {/* Card 2 - Active */}
            <div className="group relative bg-brand-orange rounded-[32px] p-8 transform md:-translate-y-4 shadow-glow">
               <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <ArrowRight className="text-white -rotate-45 group-hover:rotate-0 transition-transform" />
               </div>
               <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold mb-6">S</div>
               <h3 className="text-2xl font-bold text-white mb-2">Student Tasks</h3>
               <p className="text-black/60 text-sm font-bold mb-4">Help Peers</p>
               <p className="text-white/90 leading-relaxed mb-8">
                 Collaborate with fellow students on projects to build your portfolio and network.
               </p>
               <div className="bg-black/10 rounded-2xl h-48 w-full flex items-center justify-center">
                  <Users className="w-16 h-16 text-white/40" />
               </div>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-[#2a2a2e] rounded-[32px] p-8 transition-transform hover:-translate-y-2">
               <div className="absolute top-8 right-8 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-brand-orange group-hover:border-brand-orange transition-colors">
                  <ArrowRight className="text-white -rotate-45 group-hover:rotate-0 transition-transform" />
               </div>
               <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold mb-6">★</div>
               <h3 className="text-2xl font-bold text-white mb-2">Skill Showcase</h3>
               <p className="text-brand-orange text-sm font-medium mb-4">Get Noticed</p>
               <p className="text-gray-400 leading-relaxed mb-8">
                 Display your skills and completed projects to attract opportunities from outside.
               </p>
               <div className="bg-brand-dark/50 rounded-2xl h-48 w-full flex items-center justify-center border border-white/5">
                  <Award className="w-16 h-16 text-gray-600" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-brand-dark" id="how-it-works">
        <div className="wrapper">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-display font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">From posting a task to earning credits — here's the complete workflow</p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block transform -translate-x-1/2"></div>

            <div className="space-y-24">
              {[
                 { step: '01', title: 'Post or Take a Task', desc: 'Teachers post tasks with credit rewards. Students can take teacher tasks or post peer tasks.', icon: Zap },
                 { step: '02', title: 'Collaborate via Chat', desc: 'Private chat rooms open between task poster and taker for seamless communication.', icon: Users },
                 { step: '03', title: 'Submit Your Work', desc: 'Complete the task and submit your work for review by the task poster.', icon: CheckCircle }
              ].map((item, i) => (
                <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                   
                   {/* Text */}
                   <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center`}>
                      <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                   </div>
                   
                   {/* Icon Bubble */}
                   <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-brand-orange flex items-center justify-center text-white shadow-glow text-xl font-bold border-4 border-brand-dark">
                         {i === 1 ? <Users size={24} /> : i === 2 ? <CheckCircle size={24} /> : <Zap size={24} />}
                      </div>
                      <div className="mt-2 text-center text-xs font-mono text-gray-500">{item.step}</div>
                   </div>
                   
                   {/* Spacer/Image Area */}
                   <div className="flex-1 hidden md:block">
                      <div className="bg-brand-surface border border-white/5 rounded-2xl p-6 h-32 w-full max-w-[300px] mx-auto opacity-50 hover:opacity-100 transition-opacity flex flex-col justify-center">
                         <div className="w-full h-2 bg-white/10 rounded-full mb-3 overflow-hidden">
                           <div className="h-full bg-brand-orange w-1/2"></div>
                         </div>
                         <div className="w-2/3 h-2 bg-white/5 rounded-full"></div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-brand-orange/10"></div>
         <div className="wrapper relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
               Ready to specific start?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
               Join hundreds of MITS students and teachers already using SkillFlare to achieve more together.
            </p>
            <Link to="/register" className="btn-primary px-10 py-4 text-lg shadow-glow">
               Create Free Account
            </Link>
         </div>
      </section>
    </div>
  );
};

export default Home;
