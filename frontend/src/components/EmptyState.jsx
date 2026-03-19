import { FileText, AlertCircle } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FileText,
  title = 'No data found',
  description = '',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-secondary dark:text-text-dark-secondary" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-text-secondary dark:text-text-dark-secondary max-w-md mb-4">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export const ErrorState = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Error"
      description={message}
      action={
        onRetry && (
          <button onClick={onRetry} className="btn-primary">
            Try Again
          </button>
        )
      }
    />
  );
};

export default EmptyState;
