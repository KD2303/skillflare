import { Loader2 } from 'lucide-react';

const Loading = ({ size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className={`${sizeClasses[size]} text-mits-blue animate-spin`} />
      {text && (
        <p className="mt-4 text-text-secondary dark:text-text-dark-secondary">
          {text}
        </p>
      )}
    </div>
  );
};

export const PageLoading = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading size="large" text="Loading..." />
    </div>
  );
};

export const ButtonLoading = () => {
  return <Loader2 className="w-5 h-5 animate-spin" />;
};

export default Loading;
