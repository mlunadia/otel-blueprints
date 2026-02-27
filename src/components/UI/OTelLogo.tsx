// Official Kubernetes logo — mono-color with visible helm wheel
export function KubernetesIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 722 702"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Heptagonal shield */}
      <path
        fill="currentColor"
        d="M361 0c-9.7 0-19.3 2.5-27.8 7.3L71.5 131.8c-17 9.6-29 26.3-32.8 45.5L.3 460.5c-3.8 19.2.5 39.1 11.8 54.5L152.8 680c11.3 15.4 29.3 24.5 48.5 24.5h299.4c19.2 0 37.2-9.1 48.5-24.5l140.7-165c11.3-15.4 15.6-35.3 11.8-54.5l-38.4-283.2c-3.8-19.2-15.8-35.9-32.8-45.5L369.8 7.3C365.6 4.9 361 0 361 0z"
      />
      {/* Helm wheel — white with opacity for contrast */}
      <g transform="translate(361,351)">
        {/* Outer ring */}
        <circle cx="0" cy="0" r="165" fill="none" stroke="white" strokeWidth="24" opacity="0.9" />
        {/* 7 spokes */}
        <line x1="0" y1="0" x2="0" y2="-165" stroke="white" strokeWidth="24" strokeLinecap="round" opacity="0.9" />
        <line x1="0" y1="0" x2="145" y2="-81" stroke="white" strokeWidth="24" strokeLinecap="round" opacity="0.9" />
        <line x1="0" y1="0" x2="157" y2="63" stroke="white" strokeWidth="24" strokeLinecap="round" opacity="0.9" />
        <line x1="0" y1="0" x2="89" y2="165" stroke="white" strokeWidth="24" strokeLinecap="round" opacity="0.9" />
        <line x1="0" y1="0" x2="-89" y2="165" stroke="white" strokeWidth="24" strokeLinecap="round" opacity="0.9" />
        <line x1="0" y1="0" x2="-157" y2="63" stroke="white" strokeWidth="24" strokeLinecap="round" opacity="0.9" />
        <line x1="0" y1="0" x2="-145" y2="-81" stroke="white" strokeWidth="24" strokeLinecap="round" opacity="0.9" />
        {/* Center dot */}
        <circle cx="0" cy="0" r="36" fill="white" opacity="0.9" />
        {/* Spoke end dots */}
        <circle cx="0" cy="-165" r="16" fill="white" opacity="0.9" />
        <circle cx="145" cy="-81" r="16" fill="white" opacity="0.9" />
        <circle cx="157" cy="63" r="16" fill="white" opacity="0.9" />
        <circle cx="89" cy="165" r="16" fill="white" opacity="0.9" />
        <circle cx="-89" cy="165" r="16" fill="white" opacity="0.9" />
        <circle cx="-157" cy="63" r="16" fill="white" opacity="0.9" />
        <circle cx="-145" cy="-81" r="16" fill="white" opacity="0.9" />
      </g>
    </svg>
  );
}

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
