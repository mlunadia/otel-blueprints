// OpenTelemetry logo as a mono-color SVG component
interface OTelLogoProps {
  size?: number;
  className?: string;
}

export function OTelLogo({ size = 20, className = '' }: OTelLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="currentColor"
      className={className}
    >
      {/* OpenTelemetry logo - simplified mono version */}
      <path d="M64 8C33.1 8 8 33.1 8 64s25.1 56 56 56 56-25.1 56-56S94.9 8 64 8zm0 8c26.5 0 48 21.5 48 48s-21.5 48-48 48-48-21.5-48-48 21.5-48 48-48z" />
      <path d="M64 28c-19.9 0-36 16.1-36 36s16.1 36 36 36 36-16.1 36-36-16.1-36-36-36zm0 8c15.5 0 28 12.5 28 28s-12.5 28-28 28-28-12.5-28-28 12.5-28 28-28z" />
      <circle cx="64" cy="64" r="16" />
      {/* Rays */}
      <rect x="60" y="4" width="8" height="16" rx="2" />
      <rect x="60" y="108" width="8" height="16" rx="2" />
      <rect x="4" y="60" width="16" height="8" rx="2" />
      <rect x="108" y="60" width="16" height="8" rx="2" />
      {/* Diagonal rays */}
      <rect x="18" y="18" width="8" height="16" rx="2" transform="rotate(45 22 26)" />
      <rect x="102" y="18" width="8" height="16" rx="2" transform="rotate(-45 106 26)" />
      <rect x="18" y="94" width="8" height="16" rx="2" transform="rotate(-45 22 102)" />
      <rect x="102" y="94" width="8" height="16" rx="2" transform="rotate(45 106 102)" />
    </svg>
  );
}

// OpenTelemetry Collector icon - mono-color version of the official OTel logo
export function CollectorIcon({ size = 20, className = '' }: OTelLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="-12.70 -12.70 1024.40 1024.40" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Official OpenTelemetry logo paths - mono color version */}
      {/* Orange part of original logo - the circle and diagonal element */}
      <path 
        fill="currentColor" 
        d="M528.7 545.9c-42 42-42 110.1 0 152.1s110.1 42 152.1 0 42-110.1 0-152.1-110.1-42-152.1 0zm113.7 113.8c-20.8 20.8-54.5 20.8-75.3 0-20.8-20.8-20.8-54.5 0-75.3 20.8-20.8 54.5-20.8 75.3 0 20.8 20.7 20.8 54.5 0 75.3zm36.6-643l-65.9 65.9c-12.9 12.9-12.9 34.1 0 47l257.3 257.3c12.9 12.9 34.1 12.9 47 0l65.9-65.9c12.9-12.9 12.9-34.1 0-47L725.9 16.7c-12.9-12.9-34-12.9-46.9 0zM217.3 858.8c11.7-11.7 11.7-30.8 0-42.5l-33.5-33.5c-11.7-11.7-30.8-11.7-42.5 0L72.1 852l-.1.1-19-19c-10.5-10.5-27.6-10.5-38 0-10.5 10.5-10.5 27.6 0 38l114 114c10.5 10.5 27.6 10.5 38 0s10.5-27.6 0-38l-19-19 .1-.1 69.2-69.2z"
      />
      {/* Blue part of original logo - the angular shapes */}
      <path 
        fill="currentColor" 
        opacity="0.7"
        d="M565.9 205.9L419.5 352.3c-13 13-13 34.4 0 47.4l90.4 90.4c63.9-46 153.5-40.3 211 17.2l73.2-73.2c13-13 13-34.4 0-47.4L613.3 205.9c-13-13.1-34.4-13.1-47.4 0zm-94 322.3l-53.4-53.4c-12.5-12.5-33-12.5-45.5 0L184.7 663.2c-12.5 12.5-12.5 33 0 45.5l106.7 106.7c12.5 12.5 33 12.5 45.5 0L458 694.1c-25.6-52.9-21-116.8 13.9-165.9z"
      />
    </svg>
  );
}
