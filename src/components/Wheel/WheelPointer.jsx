function WheelPointer({ isSpinning }) {
  return (
    <div
      className={`wheel-pointer${isSpinning ? ' wheel-pointer--spinning' : ''}`}
      aria-hidden="true"
    >
      <span />
    </div>
  )
}

export default WheelPointer
