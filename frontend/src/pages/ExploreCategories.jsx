import React from "react";
import { Link } from "react-router-dom";

/* eslint-disable react/prop-types */

import electronicsImg from "../assets/categories/Electronics.jpg";
import fashionImg from "../assets/categories/Fashions.jpg";
import collectiblesImg from "../assets/categories/Collectibles.jpg";
import artImg from "../assets/categories/Art.jpg";
import furnitureImg from "../assets/categories/Furniture.jpg";
import othersImg from "../assets/categories/Others.jpg";

const CATEGORY_LIST = [
  {
    value: "electronics",
    label: "Electronics",
    img: electronicsImg,
  },
  {
    value: "fashion",
    label: "Fashion",
    img: fashionImg,
  },
  {
    value: "collectibles",
    label: "Collectibles",
    img: collectiblesImg,
  },
  {
    value: "art",
    label: "Art",
    img: artImg,
  },
  {
    value: "furniture",
    label: "Furniture",
    img: furnitureImg,
  },
  {
    value: "others",
    label: "Others",
    img: othersImg,
  },
];

export default function ExploreCategories({ categories }) {
  const list = categories || CATEGORY_LIST;

  return (
    <section className="mt-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-2">Explore by Category</h2>
        <p className="text-sm text-gray-600 mb-6">Discover unique items across diverse collections</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {list.map((c) => (
            <Link
              key={c.value}
              to={`/categories?category=${encodeURIComponent(c.value)}`}
              className="group block bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                <img
                  src={c.img}
                  alt={c.label}
                  className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-3 text-center">
                <div className="font-medium text-sm text-gray-800">{c.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}