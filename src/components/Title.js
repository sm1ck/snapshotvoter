import React from "react";
import { Helmet } from "react-helmet";

// Компонент быстрого изменения заголовка страницы

export default function Title({ title }) {
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
    </>
  );
}
