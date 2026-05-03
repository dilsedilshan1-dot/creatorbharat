"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import styles from "./IndiaMap3D.module.css";

const GEOJSON_URL =
  "https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States";

const FLAG_COLORS = ["#FF9933", "#FFFFFF", "#138808"];

export default function IndiaMap3D({ mob }) {
  const svgRef  = useRef(null);
  const wrapRef = useRef(null);
  const [selectedState, setSelectedState] = useState(null);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start end", "center center"]
  });

  // Scale map only on desktop. On mobile, stay fixed.
  const scale = useTransform(scrollYProgress, [0, 1], mob ? [1, 1] : [0.7, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], mob ? [1, 1] : [0, 1]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const d3 = await import("d3");
      let geojson;
      try {
        const res = await fetch(GEOJSON_URL);
        geojson = await res.json();
      } catch (e) {
        return;
      }
      if (cancelled) return;
      const features = geojson.features || geojson;
      drawMap(d3, features);
      setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, []);

  function drawMap(d3, features) {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const W = 560, H = 640;
    const projection = d3.geoMercator()
      .center([82.5, 22.5])
      .scale(950)
      .translate([W / 2, H / 2]);
    const pathGen = d3.geoPath().projection(projection);
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const mapG = svg.append("g").attr("id","mapG");

    mapG.selectAll("path")
      .data(features)
      .join("path")
      .attr("d", pathGen)
      .attr("fill", (_,i) => FLAG_COLORS[i % FLAG_COLORS.length])
      .attr("stroke", "#000080")
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", 0.2)
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        const name = d.properties.NAME_1 || d.properties.State_Name || d.properties.state || "";
        setSelectedState(name);
        d3.selectAll("path").attr("stroke-width", 0.5).attr("stroke-opacity", 0.2);
        d3.select(this).attr("stroke-width", 2).attr("stroke-opacity", 1).attr("stroke", "#000080");
        setTimeout(() => setSelectedState(null), 3000);
      });
  }

  return (
    <section ref={wrapRef} className={styles.mapSection}>
      <motion.div style={{ scale, opacity }} className={styles.contentWrap}>
        <div className={styles.header}>
          <span className={styles.tag}>Network</span>
          <h2 className={styles.title}>The Heart of <span className={styles.accent}>Bharat</span></h2>
          <p className={styles.sub}>Connecting 28 States & 8 Union Territories</p>
          <div className={styles.flagLine} />
        </div>

        <div className={styles.svgWrap}>
          {/* Left Annotation (Rajasthan/Bhilwara) */}
          {!mob && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className={styles.annotationLeft}
            >
              <div className={styles.annoText}>
                Hum Rajasthan ke <span className={styles.annoHighlight}>Bhilwara</span> se pure India ke creators ko list karenge.
              </div>
              <div className={styles.annoLineLeft} />
            </motion.div>
          )}

          <svg ref={svgRef} viewBox="0 0 560 640" className={styles.svg} />
          
          {selectedState && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className={styles.stateLabel}
            >
              {selectedState}
            </motion.div>
          )}

          {/* Right Annotation (Talent Mission) */}
          {!mob && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className={styles.annotationRight}
            >
              <div className={styles.annoLineRight} />
              <div className={styles.annoText}>
                Tier 2 aur Tier 3 <span className={styles.annoHighlight}>cities ka talent</span> ab poori duniya tak pahunchega.
              </div>
            </motion.div>
          )}

          {/* Floating Motive Tags (Desktop only) */}
          {!mob && (
            <>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={`${styles.floatingTag} ${styles.topRight}`}>
                Digital Identity for every Indian Creator
              </motion.div>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={`${styles.floatingTag} ${styles.bottomLeft}`}>
                Breaking the Agency Monopoly
              </motion.div>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={`${styles.floatingTag} ${styles.topCenter}`}>
                Authentic Bharat Stories
              </motion.div>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={`${styles.floatingTag} ${styles.midLeft}`}>
                Zero Commission, 100% Growth
              </motion.div>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={`${styles.floatingTag} ${styles.midRight}`}>
                Empowering the Local Soul
              </motion.div>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={`${styles.floatingTag} ${styles.bottomRight}`}>
                Identity is your Currency
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
}
