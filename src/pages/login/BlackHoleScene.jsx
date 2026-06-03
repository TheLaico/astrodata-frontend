import React from "react";
import fondoLogin from "../../image/fondoLogin.jpg";

export default function BlackHoleScene() {
  return (
    <section className="black-hole-scene" aria-hidden="true">
      <img src={fondoLogin} alt="" />
      <div className="event-horizon-glass" />
    </section>
  );
}
