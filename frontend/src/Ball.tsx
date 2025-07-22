interface BallProps {
  x: number,
  y: number,
  size: number,
  color: string,
}

const Ball = (props: BallProps) => {
  return (
    <svg 
      width={props.size}
      height={props.size}
      style={{
      position: 'absolute',
      left: props.x,
      top: props.y,
      overflow: 'visible',
      pointerEvents: 'none'
    }}
    aria-hidden="true"
  >
    <circle
      cx={props.size / 2}
      cy={props.size / 2}
      r={props.size / 2}
      fill={props.color}
    />
  </svg>
  )
}

export { Ball };
