{
  "datasets": [
    {
      "name": "85eee3cd",
      "displayName": "Tus clientes",
      "queryLines": [
        "SELECT \r\n",
        "  customer_id, \r\n",
        "  surname,\r\n",
        "  geography, \r\n",
        "  gender, \r\n",
        "  age, \r\n",
        "  balance, \r\n",
        "  num_products, \r\n",
        "  ROUND(prob_churn, 4) AS prob_pct\r\n",
        "FROM churn_poc.customer_churn2_gold.customer_churn_gold_combined_simulated\r\n",
        "WHERE period = '2025'\r\n",
        "  AND (COALESCE(:prob_min, 0) = 0 OR prob_churn >= :prob_min)\r\n",
        "  AND (COALESCE(:prob_max, 1) = 1 OR prob_churn <= :prob_max)\r\n",
        "ORDER BY prob_churn DESC;\r\n"
      ],
      "parameters": [
        {
          "displayName": "prob_min",
          "keyword": "prob_min",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "0"
                }
              ]
            }
          }
        },
        {
          "displayName": "prob_max",
          "keyword": "prob_max",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "1"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "27cdf85d",
      "displayName": "Rendimiento_1",
      "queryLines": [
        "SELECT\r\n",
        "  COUNT(*) AS total_registros,\r\n",
        "\r\n",
        "  SUM(CASE WHEN (prob_churn >= (:threshold_global / 100.0)) AND exited = 1 THEN 1 ELSE 0 END) AS verdaderos_positivos,\r\n",
        "  SUM(CASE WHEN (prob_churn <  (:threshold_global / 100.0)) AND exited = 0 THEN 1 ELSE 0 END) AS verdaderos_negativos,\r\n",
        "  SUM(CASE WHEN (prob_churn >= (:threshold_global / 100.0)) AND exited = 0 THEN 1 ELSE 0 END) AS falsos_positivos,\r\n",
        "  SUM(CASE WHEN (prob_churn <  (:threshold_global / 100.0)) AND exited = 1 THEN 1 ELSE 0 END) AS falsos_negativos,\r\n",
        "\r\n",
        "  ROUND(SUM(CASE WHEN ((prob_churn >= (:threshold_global / 100.0)) AND exited = 1) \r\n",
        "                 OR ((prob_churn <  (:threshold_global / 100.0)) AND exited = 0) \r\n",
        "            THEN 1 ELSE 0 END) * 1.0 / COUNT(*), 3) AS accuracy,\r\n",
        "\r\n",
        "  ROUND(SUM(CASE WHEN (prob_churn >= (:threshold_global / 100.0)) AND exited = 1 THEN 1 ELSE 0 END) * 1.0 /\r\n",
        "        NULLIF(SUM(CASE WHEN (prob_churn >= (:threshold_global / 100.0)) THEN 1 ELSE 0 END), 0), 3) AS precision,\r\n",
        "\r\n",
        "  ROUND(SUM(CASE WHEN (prob_churn >= (:threshold_global / 100.0)) AND exited = 1 THEN 1 ELSE 0 END) * 1.0 /\r\n",
        "        NULLIF(SUM(CASE WHEN exited = 1 THEN 1 ELSE 0 END), 0), 3) AS recall,\r\n",
        "\r\n",
        "  ROUND(\r\n",
        "    2 * (\r\n",
        "      (SUM(CASE WHEN (prob_churn >= (:threshold_global / 100.0)) AND exited = 1 THEN 1 ELSE 0 END) * 1.0) /\r\n",
        "      NULLIF(\r\n",
        "        (SUM(CASE WHEN (prob_churn >= (:threshold_global / 100.0)) THEN 1 ELSE 0 END) +\r\n",
        "         SUM(CASE WHEN exited = 1 THEN 1 ELSE 0 END)), 0\r\n",
        "      )\r\n",
        "    ), 3\r\n",
        "  ) AS f1_score\r\n",
        "\r\n",
        "FROM churn_poc.customer_churn2_gold.customer_churn_gold_combined_simulated\r\n",
        "WHERE period = '2024';\r\n",
        "\r\n"
      ],
      "parameters": [
        {
          "displayName": "threshold_global",
          "keyword": "threshold_global",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "50"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "e026c21f",
      "displayName": "Rendimiento_2",
      "queryLines": [
        "SELECT\r\n",
        "  CASE \r\n",
        "    WHEN exited = 1 THEN 'Real: Churn'\r\n",
        "    ELSE 'Real: Retenido'\r\n",
        "  END AS valor_real,\r\n",
        "  CASE \r\n",
        "    WHEN prob_churn >= (:threshold_global / 100.0) THEN 'Predicho: Churn'\r\n",
        "    ELSE 'Predicho: Retenido'\r\n",
        "  END AS valor_predicho,\r\n",
        "  COUNT(*) AS cantidad\r\n",
        "FROM churn_poc.customer_churn2_gold.customer_churn_gold_combined_simulated\r\n",
        "WHERE period = '2024'\r\n",
        "GROUP BY 1, 2;\r\n"
      ],
      "parameters": [
        {
          "displayName": "threshold_global",
          "keyword": "threshold_global",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "50"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "b913f749",
      "displayName": "Calculadora",
      "queryLines": [
        "WITH base AS (\r\n",
        "  SELECT *\r\n",
        "  FROM churn_poc.customer_churn2_gold.customer_churn_gold_combined_simulated\r\n",
        "  WHERE period = '2025'\r\n",
        "),\r\n",
        "riesgo AS (\r\n",
        "  SELECT\r\n",
        "    COUNT(*) AS clientes_en_riesgo\r\n",
        "  FROM base\r\n",
        "  WHERE prob_churn >= (:threshold_global / 100.0)\r\n",
        "),\r\n",
        "calculos AS (\r\n",
        "  SELECT\r\n",
        "    r.clientes_en_riesgo,\r\n",
        "    -- Costo total de retención\r\n",
        "    r.clientes_en_riesgo * :costo_retencion AS costo_total_retencion,\r\n",
        "\r\n",
        "    -- Clientes retenidos esperados\r\n",
        "    r.clientes_en_riesgo * (:tasa_exito_retencion / 100.0) AS clientes_retenidos_esperados,\r\n",
        "\r\n",
        "    -- Valor conservado\r\n",
        "    r.clientes_en_riesgo * (:tasa_exito_retencion / 100.0) * :valor_cliente_promedio AS valor_conservado,\r\n",
        "\r\n",
        "    -- ROI estimado\r\n",
        "    (\r\n",
        "      (\r\n",
        "        (r.clientes_en_riesgo * (:tasa_exito_retencion / 100.0) * :valor_cliente_promedio)\r\n",
        "        - (r.clientes_en_riesgo * :costo_retencion)\r\n",
        "      )\r\n",
        "      / NULLIF((r.clientes_en_riesgo * :costo_retencion), 0)\r\n",
        "    ) AS roi_estimado,\r\n",
        "\r\n",
        "    -- Pérdida esperada sin acción\r\n",
        "    r.clientes_en_riesgo * :valor_cliente_promedio AS perdida_sin_accion,\r\n",
        "\r\n",
        "    -- Costo de reemplazo\r\n",
        "    r.clientes_en_riesgo * :costo_adquisicion AS costo_reemplazo\r\n",
        "  FROM riesgo r\r\n",
        "),\r\n",
        "comparativo AS (\r\n",
        "  SELECT 'Retención' AS estrategia, r.clientes_en_riesgo * :costo_retencion AS costo\r\n",
        "  FROM riesgo r\r\n",
        "  UNION ALL\r\n",
        "  SELECT 'Adquisición' AS estrategia, r.clientes_en_riesgo * :costo_adquisicion AS costo\r\n",
        "  FROM riesgo r\r\n",
        ")\r\n",
        "SELECT\r\n",
        "  c.clientes_en_riesgo,\r\n",
        "  c.costo_total_retencion,\r\n",
        "  c.clientes_retenidos_esperados,\r\n",
        "  c.valor_conservado,\r\n",
        "  c.roi_estimado,\r\n",
        "  c.perdida_sin_accion,\r\n",
        "  c.costo_reemplazo,\r\n",
        "  cmp.estrategia,\r\n",
        "  cmp.costo AS costo_estrategia\r\n",
        "FROM calculos c\r\n",
        "CROSS JOIN comparativo cmp;\r\n"
      ],
      "parameters": [
        {
          "displayName": "threshold_global",
          "keyword": "threshold_global",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "50"
                }
              ]
            }
          }
        },
        {
          "displayName": "costo_retencion",
          "keyword": "costo_retencion",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "0"
                }
              ]
            }
          }
        },
        {
          "displayName": "tasa_exito_retencion",
          "keyword": "tasa_exito_retencion",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "0"
                }
              ]
            }
          }
        },
        {
          "displayName": "valor_cliente_promedio",
          "keyword": "valor_cliente_promedio",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "0"
                }
              ]
            }
          }
        },
        {
          "displayName": "costo_adquisicion",
          "keyword": "costo_adquisicion",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "0"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "92ad8ba4",
      "displayName": "change_%",
      "queryLines": [
        "SELECT \r\n",
        "  period,\r\n",
        "  ROUND(AVG(prob_churn), 2) AS churn_promedio_pct\r\n",
        "FROM churn_poc.customer_churn2_gold.customer_churn_gold_combined_simulated\r\n",
        "GROUP BY period\r\n",
        "ORDER BY period;\r\n"
      ]
    },
    {
      "name": "fbaf2785",
      "displayName": "change_kpi",
      "queryLines": [
        "SELECT\r\n",
        "  -- Clientes en riesgo\r\n",
        "  SUM(CASE WHEN period = '2025' AND prob_churn >= (:threshold_global / 100.0) THEN 1 ELSE 0 END) AS clientes_en_riesgo_2025,\r\n",
        "  SUM(CASE WHEN period = '2024' AND prob_churn >= (:threshold_global / 100.0) THEN 1 ELSE 0 END) AS clientes_en_riesgo_2024,\r\n",
        "\r\n",
        "  -- Totales por periodo (todos los clientes)\r\n",
        "  SUM(CASE WHEN period = '2025' THEN 1 ELSE 0 END) AS total_clientes_2025,\r\n",
        "  SUM(CASE WHEN period = '2024' THEN 1 ELSE 0 END) AS total_clientes_2024\r\n",
        "FROM churn_poc.customer_churn2_gold.customer_churn_gold_combined_simulated;\r\n"
      ],
      "parameters": [
        {
          "displayName": "threshold_global",
          "keyword": "threshold_global",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "50"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "84ab7433",
      "displayName": "Panel_age",
      "queryLines": [
        "SELECT \r\n",
        "  age AS edad,\r\n",
        "  ROUND(AVG(prob_churn), 2) AS prob_churn_pct\r\n",
        "FROM churn_poc.customer_churn2_gold.customer_churn_gold_combined_simulated\r\n",
        "WHERE period = '2025'\r\n",
        "GROUP BY age\r\n",
        "ORDER BY age;\r\n"
      ]
    },
    {
      "name": "1b998146",
      "displayName": "Panel_map",
      "queryLines": [
        "SELECT \n",
        "  CASE geography\n",
        "    WHEN 'France' THEN 'FR'\n",
        "    WHEN 'Germany' THEN 'DE'\n",
        "    WHEN 'Spain' THEN 'ES'\n",
        "    ELSE 'OT'\n",
        "  END AS country_code,\n",
        "  ROUND(SUM(CASE WHEN prob_churn >= (:threshold_global / 100.0) THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS porcentaje_en_riesgo\n",
        "FROM churn_poc.customer_churn2_gold.customer_churn_gold_combined_simulated\n",
        "WHERE period = '2025'\n",
        "GROUP BY country_code\n",
        "ORDER BY porcentaje_en_riesgo DESC;\n"
      ],
      "parameters": [
        {
          "displayName": "threshold_global",
          "keyword": "threshold_global",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "50"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "82d91fb3",
      "displayName": "Panel_pchart",
      "queryLines": [
        "SELECT \r\n",
        "  CASE \r\n",
        "    WHEN prob_churn >= (:threshold_global / 100.0) THEN 'En riesgo'\r\n",
        "    ELSE 'Retenidos'\r\n",
        "  END AS estado,\r\n",
        "  COUNT(*) AS cantidad\r\n",
        "FROM churn_poc.customer_churn2_gold.customer_churn_gold_combined_simulated\r\n",
        "WHERE period = '2025'\r\n",
        "GROUP BY 1;\r\n"
      ],
      "parameters": [
        {
          "displayName": "threshold_global",
          "keyword": "threshold_global",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "50"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "f4077d86",
      "displayName": "Panel_geography",
      "queryLines": [
        "-- === BASE DE DATOS ===\r\n",
        "WITH base AS (\r\n",
        "  SELECT\r\n",
        "    customer_id,\r\n",
        "    age,\r\n",
        "    geography,\r\n",
        "    prob_churn,\r\n",
        "    pred_churn,\r\n",
        "    period,\r\n",
        "    CASE \r\n",
        "      WHEN prob_churn >= (:threshold_global / 100.0) THEN 'En riesgo'\r\n",
        "      ELSE 'Retenidos'\r\n",
        "    END AS estado\r\n",
        "  FROM churn_poc.customer_churn2_gold.customer_churn_gold_combined_simulated\r\n",
        "  WHERE period = '2025'\r\n",
        ")\r\n",
        "\r\n",
        "-- === RESUMEN GENERAL ===\r\n",
        ", resumen AS (\r\n",
        "  SELECT\r\n",
        "    COUNT(*) AS total_clientes,\r\n",
        "    ROUND(AVG(prob_churn), 4) AS prob_promedio_pct,\r\n",
        "    SUM(CASE WHEN estado = 'En riesgo' THEN 1 ELSE 0 END) AS clientes_en_riesgo,\r\n",
        "    SUM(CASE WHEN estado = 'Retenidos' THEN 1 ELSE 0 END) AS clientes_retenidos,\r\n",
        "    ROUND(AVG(age), 1) AS edad_promedio\r\n",
        "  FROM base\r\n",
        ")\r\n",
        "\r\n",
        "-- === DISTRIBUCION POR ESTADO ===\r\n",
        ", por_estado AS (\r\n",
        "  SELECT\r\n",
        "    estado,\r\n",
        "    COUNT(*) AS cantidad\r\n",
        "  FROM base\r\n",
        "  GROUP BY estado\r\n",
        ")\r\n",
        "\r\n",
        "-- === CHURN PROMEDIO POR PAÍS ===\r\n",
        ", por_pais AS (\r\n",
        "  SELECT\r\n",
        "    geography AS pais,\r\n",
        "    ROUND(AVG(pred_churn), 2) AS churn_rate_pct\r\n",
        "  FROM base\r\n",
        "  GROUP BY geography\r\n",
        ")\r\n",
        "\r\n",
        "-- === PORCENTAJE EN RIESGO POR PAÍS (CÓDIGOS ISO) ===\r\n",
        ", riesgo_pais AS (\r\n",
        "  SELECT\r\n",
        "    CASE geography\r\n",
        "      WHEN 'France' THEN 'FR'\r\n",
        "      WHEN 'Germany' THEN 'DE'\r\n",
        "      WHEN 'Spain' THEN 'ES'\r\n",
        "      ELSE 'OT'\r\n",
        "    END AS country_code,\r\n",
        "    ROUND(SUM(CASE WHEN estado = 'En riesgo' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS porcentaje_en_riesgo\r\n",
        "  FROM base\r\n",
        "  GROUP BY geography\r\n",
        ")\r\n",
        "\r\n",
        "-- === CHURN PROMEDIO POR EDAD ===\r\n",
        ", por_edad AS (\r\n",
        "  SELECT\r\n",
        "    age AS edad,\r\n",
        "    ROUND(AVG(prob_churn), 2) AS prob_churn_pct\r\n",
        "  FROM base\r\n",
        "  GROUP BY age\r\n",
        ")\r\n",
        "\r\n",
        "-- === UNION FINAL PARA DASHBOARD ===\r\n",
        "SELECT\r\n",
        "  r.total_clientes,\r\n",
        "  r.prob_promedio_pct,\r\n",
        "  r.clientes_en_riesgo,\r\n",
        "  r.clientes_retenidos,\r\n",
        "  r.edad_promedio,\r\n",
        "  e.estado,\r\n",
        "  e.cantidad,\r\n",
        "  p.pais,\r\n",
        "  p.churn_rate_pct,\r\n",
        "  rp.country_code,\r\n",
        "  rp.porcentaje_en_riesgo,\r\n",
        "  ed.edad,\r\n",
        "  ed.prob_churn_pct\r\n",
        "FROM resumen r\r\n",
        "CROSS JOIN por_estado e\r\n",
        "LEFT JOIN por_pais p ON 1=1\r\n",
        "LEFT JOIN riesgo_pais rp ON 1=1\r\n",
        "LEFT JOIN por_edad ed ON 1=1;\r\n"
      ],
      "parameters": [
        {
          "displayName": "threshold_global",
          "keyword": "threshold_global",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "50"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "3fe836cc",
      "displayName": "Panel_KPI",
      "queryLines": [
        "SELECT\r\n",
        "  COUNT(*) AS total_clientes,\r\n",
        "  SUM(CASE WHEN prob_churn >= (:threshold_global / 100.0) THEN 1 ELSE 0 END) AS clientes_en_riesgo,\r\n",
        "  SUM(CASE WHEN prob_churn < (:threshold_global / 100.0) THEN 1 ELSE 0 END) AS clientes_retenidos,\r\n",
        "  ROUND(AVG(prob_churn), 4) AS prob_promedio_pct,\r\n",
        "  ROUND(AVG(age), 1) AS edad_promedio\r\n",
        "FROM churn_poc.customer_churn2_gold.customer_churn_gold_combined_simulated\r\n",
        "WHERE period = '2025';"
      ],
      "parameters": [
        {
          "displayName": "threshold_global",
          "keyword": "threshold_global",
          "dataType": "STRING",
          "defaultSelection": {
            "values": {
              "dataType": "STRING",
              "values": [
                {
                  "value": "50"
                }
              ]
            }
          }
        }
      ]
    }
  ],
  "pages": [
    {
      "name": "3b6b8190",
      "displayName": "Panel de control",
      "layout": [
        {
          "widget": {
            "name": "09b3dc34",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "3fe836cc",
                  "fields": [
                    {
                      "name": "sum(total_clientes)",
                      "expression": "SUM(`total_clientes`)"
                    }
                  ],
                  "disaggregated": false
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "sum(total_clientes)",
                  "format": {
                    "type": "number-plain",
                    "abbreviation": "none",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  },
                  "style": {
                    "bold": true,
                    "italic": true
                  }
                }
              },
              "frame": {
                "showDescription": false,
                "title": "Total Clientes",
                "showTitle": true
              }
            }
          },
          "position": {
            "x": 0,
            "y": 2,
            "width": 2,
            "height": 4
          }
        },
        {
          "widget": {
            "name": "60ba9215",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "3fe836cc",
                  "fields": [
                    {
                      "name": "sum(total_clientes)",
                      "expression": "SUM(`total_clientes`)"
                    },
                    {
                      "name": "sum(clientes_en_riesgo)",
                      "expression": "SUM(`clientes_en_riesgo`)"
                    }
                  ],
                  "disaggregated": false
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "sum(clientes_en_riesgo)",
                  "format": {
                    "type": "number-plain",
                    "abbreviation": "none",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  },
                  "style": {
                    "color": {
                      "themeColorType": "visualizationColors",
                      "position": 4
                    },
                    "italic": true
                  }
                },
                "target": {
                  "fieldName": "sum(total_clientes)",
                  "format": {
                    "type": "number-plain",
                    "abbreviation": "none",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "# de clientes con una probabilidad mayor a la del umbral de hacer churn",
                "showDescription": false,
                "description": ""
              }
            }
          },
          "position": {
            "x": 4,
            "y": 2,
            "width": 2,
            "height": 4
          }
        },
        {
          "widget": {
            "name": "2ebfb795",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "3fe836cc",
                  "fields": [
                    {
                      "name": "prob_promedio_pct",
                      "expression": "`prob_promedio_pct`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "prob_promedio_pct",
                  "format": {
                    "type": "number-percent",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  },
                  "style": {
                    "rules": [
                      {
                        "condition": {
                          "operator": ">=",
                          "operand": {
                            "type": "data-value",
                            "value": "0.25"
                          }
                        },
                        "color": {
                          "themeColorType": "visualizationColors",
                          "position": 2
                        }
                      },
                      {
                        "condition": {
                          "operator": ">="
                        },
                        "color": "#00A972"
                      }
                    ]
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Probabilidad promedio de que tus clientes hagan churn"
              }
            }
          },
          "position": {
            "x": 2,
            "y": 2,
            "width": 2,
            "height": 4
          }
        },
        {
          "widget": {
            "name": "723f1a62",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "82d91fb3",
                  "fields": [
                    {
                      "name": "sum(cantidad)",
                      "expression": "SUM(`cantidad`)"
                    },
                    {
                      "name": "estado",
                      "expression": "`estado`"
                    }
                  ],
                  "disaggregated": false
                }
              }
            ],
            "spec": {
              "version": 3,
              "widgetType": "pie",
              "encodings": {
                "angle": {
                  "fieldName": "sum(cantidad)",
                  "scale": {
                    "type": "quantitative"
                  },
                  "displayName": "Predcciones de mis clientes"
                },
                "color": {
                  "fieldName": "estado",
                  "scale": {
                    "type": "categorical"
                  },
                  "displayName": "Estado"
                },
                "label": {
                  "show": true
                }
              },
              "frame": {
                "showDescription": true,
                "title": "",
                "showTitle": false,
                "description": "Los clientes que están \"en riesgo\" tienen más de un ${threshold_global * 100}% de probabilidad de hacer churn según el modelo.\n\n"
              }
            }
          },
          "position": {
            "x": 0,
            "y": 6,
            "width": 3,
            "height": 6
          }
        },
        {
          "widget": {
            "name": "186de59c",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "f4077d86",
                  "fields": [
                    {
                      "name": "pais",
                      "expression": "`pais`"
                    },
                    {
                      "name": "churn_rate_pct",
                      "expression": "`churn_rate_pct`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 3,
              "widgetType": "bar",
              "encodings": {
                "x": {
                  "fieldName": "pais",
                  "scale": {
                    "type": "categorical",
                    "sort": {
                      "by": "y-reversed"
                    }
                  }
                },
                "y": {
                  "fieldName": "churn_rate_pct",
                  "scale": {
                    "type": "quantitative"
                  },
                  "format": {
                    "type": "number-percent",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  },
                  "displayName": "% de churn"
                },
                "color": {
                  "fieldName": "pais",
                  "scale": {
                    "type": "categorical",
                    "mappings": [
                      {
                        "value": "Spain",
                        "color": {
                          "themeColorType": "visualizationColors",
                          "position": 1
                        }
                      }
                    ]
                  },
                  "displayName": "País"
                },
                "label": {
                  "show": true
                }
              },
              "frame": {
                "title": "% de churn esperado por país",
                "showTitle": true
              }
            }
          },
          "position": {
            "x": 3,
            "y": 6,
            "width": 3,
            "height": 6
          }
        },
        {
          "widget": {
            "name": "9e88cd87",
            "multilineTextboxSpec": {
              "lines": [
                "## Panel de control de churn  para estimar y analizar el riesgo de pérdida de clientes, segmentado por variables demográficas y de comportamiento.\n",
                "\n",
                "Probabilidades basadas en el modelo entrenado de machine learning (XGBoost)"
              ]
            }
          },
          "position": {
            "x": 0,
            "y": 0,
            "width": 6,
            "height": 2
          }
        },
        {
          "widget": {
            "name": "fc397a2c",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "84ab7433",
                  "fields": [
                    {
                      "name": "edad",
                      "expression": "`edad`"
                    },
                    {
                      "name": "sum(prob_churn_pct)",
                      "expression": "SUM(`prob_churn_pct`)"
                    }
                  ],
                  "disaggregated": false
                }
              }
            ],
            "spec": {
              "version": 3,
              "widgetType": "bar",
              "encodings": {
                "x": {
                  "fieldName": "edad",
                  "scale": {
                    "type": "quantitative"
                  }
                },
                "y": {
                  "fieldName": "sum(prob_churn_pct)",
                  "scale": {
                    "type": "quantitative"
                  },
                  "format": {
                    "type": "number-percent",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  },
                  "displayName": "Probabilidad de churn"
                },
                "label": {
                  "show": false
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Probabilidad de churn basado en edad"
              }
            }
          },
          "position": {
            "x": 0,
            "y": 18,
            "width": 4,
            "height": 6
          }
        },
        {
          "widget": {
            "name": "377b75ba",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "3fe836cc",
                  "fields": [
                    {
                      "name": "edad_promedio",
                      "expression": "`edad_promedio`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "edad_promedio"
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Edad promedio de tus clientes",
                "showDescription": true,
                "description": ""
              }
            }
          },
          "position": {
            "x": 4,
            "y": 18,
            "width": 2,
            "height": 6
          }
        },
        {
          "widget": {
            "name": "20812710",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "1b998146",
                  "fields": [
                    {
                      "name": "porcentaje_en_riesgo",
                      "expression": "`porcentaje_en_riesgo`"
                    },
                    {
                      "name": "country_code",
                      "expression": "`country_code`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 1,
              "widgetType": "choropleth-map",
              "encodings": {
                "color": {
                  "fieldName": "porcentaje_en_riesgo",
                  "scale": {
                    "type": "quantitative",
                    "colorRamp": {
                      "mode": "scheme",
                      "scheme": "blues"
                    },
                    "domain": {
                      "min": 0,
                      "max": 50
                    }
                  },
                  "legend": {
                    "title": "% en riesgo"
                  }
                },
                "extra": [
                  {
                    "fieldName": "porcentaje_en_riesgo"
                  }
                ],
                "region": {
                  "regionType": "mapbox-v4-admin",
                  "admin0": {
                    "fieldName": "country_code",
                    "type": "field",
                    "geographicRole": "admin0-unit-code"
                  }
                }
              },
              "mark": {
                "opacity": 0.96
              },
              "frame": {
                "showTitle": true,
                "title": "% de churn por país\n"
              }
            }
          },
          "position": {
            "x": 0,
            "y": 12,
            "width": 6,
            "height": 6
          }
        }
      ],
      "pageType": "PAGE_TYPE_CANVAS"
    },
    {
      "name": "bc16cf20",
      "displayName": "Global Filters",
      "layout": [
        {
          "widget": {
            "name": "threshold_global",
            "queries": [
              {
                "name": "parameter_dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0ae8ea748111aa090ad8abf3be557_threshold_global",
                "query": {
                  "datasetName": "b913f749",
                  "parameters": [
                    {
                      "name": "threshold_global",
                      "keyword": "threshold_global"
                    }
                  ],
                  "disaggregated": false
                }
              },
              {
                "name": "parameter_dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0ae99b9111c60a31b7c7f2412f84a_threshold_global",
                "query": {
                  "datasetName": "3fe836cc",
                  "parameters": [
                    {
                      "name": "threshold_global",
                      "keyword": "threshold_global"
                    }
                  ],
                  "disaggregated": false
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "filter-single-select",
              "encodings": {
                "fields": [
                  {
                    "parameterName": "threshold_global",
                    "queryName": "parameter_dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0ae8ea748111aa090ad8abf3be557_threshold_global"
                  },
                  {
                    "parameterName": "threshold_global",
                    "queryName": "parameter_dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0ae99b9111c60a31b7c7f2412f84a_threshold_global"
                  }
                ]
              },
              "frame": {
                "showTitle": true,
                "title": "Umbral ",
                "showDescription": true,
                "description": "Este número representa un %."
              }
            }
          },
          "position": {
            "x": 0,
            "y": 0,
            "width": 1,
            "height": 2
          }
        }
      ],
      "pageType": "PAGE_TYPE_GLOBAL_FILTERS"
    },
    {
      "name": "e2251af7",
      "displayName": "Tus clientes",
      "layout": [
        {
          "widget": {
            "name": "b10d9375",
            "multilineTextboxSpec": {
              "lines": [
                "# Tus clientes\n",
                "\n",
                "Ordenados de mayor probabilidad de churn a menor, te recomendamos tomar acción con aquellos con mayores probabilidades."
              ]
            }
          },
          "position": {
            "x": 0,
            "y": 0,
            "width": 6,
            "height": 2
          }
        },
        {
          "widget": {
            "name": "43d0730e",
            "queries": [
              {
                "name": "dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0a41846a21469a5de4a06676219ba_prob_pct",
                "query": {
                  "datasetName": "85eee3cd",
                  "fields": [
                    {
                      "name": "min(prob_pct)",
                      "expression": "MIN(`prob_pct`)"
                    },
                    {
                      "name": "max(prob_pct)",
                      "expression": "MAX(`prob_pct`)"
                    }
                  ],
                  "disaggregated": false
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "range-slider",
              "encodings": {
                "fields": [
                  {
                    "fieldName": "prob_pct",
                    "queryName": "dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0a41846a21469a5de4a06676219ba_prob_pct"
                  }
                ]
              },
              "selection": {
                "defaultSelection": {
                  "operator": {
                    "operator": "AND",
                    "args": []
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Probabilidad de churn"
              }
            }
          },
          "position": {
            "x": 0,
            "y": 2,
            "width": 6,
            "height": 1
          }
        },
        {
          "widget": {
            "name": "ddf12d62",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "85eee3cd",
                  "fields": [
                    {
                      "name": "customer_id",
                      "expression": "`customer_id`"
                    },
                    {
                      "name": "surname",
                      "expression": "`surname`"
                    },
                    {
                      "name": "prob_pct",
                      "expression": "`prob_pct`"
                    },
                    {
                      "name": "Geography",
                      "expression": "`Geography`"
                    },
                    {
                      "name": "Gender",
                      "expression": "`Gender`"
                    },
                    {
                      "name": "Age",
                      "expression": "`Age`"
                    },
                    {
                      "name": "balance",
                      "expression": "`balance`"
                    },
                    {
                      "name": "num_products",
                      "expression": "`num_products`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 1,
              "widgetType": "table",
              "encodings": {
                "columns": [
                  {
                    "fieldName": "customer_id",
                    "numberFormat": "0",
                    "booleanValues": [
                      "false",
                      "true"
                    ],
                    "imageUrlTemplate": "{{ @ }}",
                    "imageTitleTemplate": "{{ @ }}",
                    "imageWidth": "",
                    "imageHeight": "",
                    "linkUrlTemplate": "{{ @ }}",
                    "linkTextTemplate": "{{ @ }}",
                    "linkTitleTemplate": "{{ @ }}",
                    "linkOpenInNewTab": true,
                    "type": "integer",
                    "displayAs": "number",
                    "visible": true,
                    "order": 0,
                    "title": "ID del cliente",
                    "allowSearch": false,
                    "alignContent": "right",
                    "allowHTML": false,
                    "highlightLinks": false,
                    "useMonospaceFont": false,
                    "preserveWhitespace": false
                  },
                  {
                    "fieldName": "surname",
                    "booleanValues": [
                      "false",
                      "true"
                    ],
                    "imageUrlTemplate": "{{ @ }}",
                    "imageTitleTemplate": "{{ @ }}",
                    "imageWidth": "",
                    "imageHeight": "",
                    "linkUrlTemplate": "{{ @ }}",
                    "linkTextTemplate": "{{ @ }}",
                    "linkTitleTemplate": "{{ @ }}",
                    "linkOpenInNewTab": true,
                    "type": "string",
                    "displayAs": "string",
                    "visible": true,
                    "order": 1,
                    "title": "Apellido",
                    "allowSearch": false,
                    "alignContent": "left",
                    "allowHTML": false,
                    "highlightLinks": false,
                    "useMonospaceFont": false,
                    "preserveWhitespace": false
                  },
                  {
                    "fieldName": "prob_pct",
                    "numberFormat": "0.00%",
                    "booleanValues": [
                      "false",
                      "true"
                    ],
                    "imageUrlTemplate": "{{ @ }}",
                    "imageTitleTemplate": "{{ @ }}",
                    "imageWidth": "",
                    "imageHeight": "",
                    "linkUrlTemplate": "{{ @ }}",
                    "linkTextTemplate": "{{ @ }}",
                    "linkTitleTemplate": "{{ @ }}",
                    "linkOpenInNewTab": true,
                    "type": "float",
                    "displayAs": "number",
                    "visible": true,
                    "order": 2,
                    "title": "Probabilidad de churn",
                    "allowSearch": false,
                    "alignContent": "right",
                    "allowHTML": false,
                    "highlightLinks": false,
                    "useMonospaceFont": false,
                    "preserveWhitespace": false,
                    "cellFormat": {
                      "default": {
                        "foregroundColor": {
                          "themeColorType": "visualizationColors",
                          "position": 3
                        }
                      },
                      "rules": [
                        {
                          "if": {
                            "column": "prob_pct",
                            "fn": ">",
                            "literal": "0.70"
                          },
                          "value": {
                            "foregroundColor": {
                              "themeColorType": "visualizationColors",
                              "position": 4
                            }
                          }
                        },
                        {
                          "if": {
                            "column": "prob_pct",
                            "fn": ">",
                            "literal": "0.50"
                          },
                          "value": {
                            "foregroundColor": {
                              "themeColorType": "visualizationColors",
                              "position": 2
                            }
                          }
                        },
                        {
                          "if": {
                            "column": "prob_pct",
                            "fn": ">",
                            "literal": "0.30"
                          },
                          "value": {
                            "foregroundColor": {
                              "themeColorType": "visualizationColors",
                              "position": 3
                            }
                          }
                        }
                      ]
                    },
                    "scalePercentBy100": true
                  },
                  {
                    "fieldName": "Geography",
                    "booleanValues": [
                      "false",
                      "true"
                    ],
                    "imageUrlTemplate": "{{ @ }}",
                    "imageTitleTemplate": "{{ @ }}",
                    "imageWidth": "",
                    "imageHeight": "",
                    "linkUrlTemplate": "{{ @ }}",
                    "linkTextTemplate": "{{ @ }}",
                    "linkTitleTemplate": "{{ @ }}",
                    "linkOpenInNewTab": true,
                    "type": "string",
                    "displayAs": "string",
                    "visible": true,
                    "order": 3,
                    "title": "País",
                    "allowSearch": false,
                    "alignContent": "left",
                    "allowHTML": false,
                    "highlightLinks": false,
                    "useMonospaceFont": false,
                    "preserveWhitespace": false
                  },
                  {
                    "fieldName": "Gender",
                    "booleanValues": [
                      "false",
                      "true"
                    ],
                    "imageUrlTemplate": "{{ @ }}",
                    "imageTitleTemplate": "{{ @ }}",
                    "imageWidth": "",
                    "imageHeight": "",
                    "linkUrlTemplate": "{{ @ }}",
                    "linkTextTemplate": "{{ @ }}",
                    "linkTitleTemplate": "{{ @ }}",
                    "linkOpenInNewTab": true,
                    "type": "string",
                    "displayAs": "string",
                    "visible": true,
                    "order": 4,
                    "title": "Genero",
                    "allowSearch": false,
                    "alignContent": "left",
                    "allowHTML": false,
                    "highlightLinks": false,
                    "useMonospaceFont": false,
                    "preserveWhitespace": false
                  },
                  {
                    "fieldName": "Age",
                    "numberFormat": "0",
                    "booleanValues": [
                      "false",
                      "true"
                    ],
                    "imageUrlTemplate": "{{ @ }}",
                    "imageTitleTemplate": "{{ @ }}",
                    "imageWidth": "",
                    "imageHeight": "",
                    "linkUrlTemplate": "{{ @ }}",
                    "linkTextTemplate": "{{ @ }}",
                    "linkTitleTemplate": "{{ @ }}",
                    "linkOpenInNewTab": true,
                    "type": "integer",
                    "displayAs": "number",
                    "visible": true,
                    "order": 5,
                    "title": "Edad",
                    "allowSearch": false,
                    "alignContent": "right",
                    "allowHTML": false,
                    "highlightLinks": false,
                    "useMonospaceFont": false,
                    "preserveWhitespace": false
                  },
                  {
                    "fieldName": "balance",
                    "numberFormat": "0.00",
                    "booleanValues": [
                      "false",
                      "true"
                    ],
                    "imageUrlTemplate": "{{ @ }}",
                    "imageTitleTemplate": "{{ @ }}",
                    "imageWidth": "",
                    "imageHeight": "",
                    "linkUrlTemplate": "{{ @ }}",
                    "linkTextTemplate": "{{ @ }}",
                    "linkTitleTemplate": "{{ @ }}",
                    "linkOpenInNewTab": true,
                    "type": "float",
                    "displayAs": "number",
                    "visible": true,
                    "order": 6,
                    "title": "Balance",
                    "allowSearch": false,
                    "alignContent": "right",
                    "allowHTML": false,
                    "highlightLinks": false,
                    "useMonospaceFont": false,
                    "preserveWhitespace": false
                  },
                  {
                    "fieldName": "num_products",
                    "numberFormat": "0",
                    "booleanValues": [
                      "false",
                      "true"
                    ],
                    "imageUrlTemplate": "{{ @ }}",
                    "imageTitleTemplate": "{{ @ }}",
                    "imageWidth": "",
                    "imageHeight": "",
                    "linkUrlTemplate": "{{ @ }}",
                    "linkTextTemplate": "{{ @ }}",
                    "linkTitleTemplate": "{{ @ }}",
                    "linkOpenInNewTab": true,
                    "type": "integer",
                    "displayAs": "number",
                    "visible": true,
                    "order": 7,
                    "title": "# de productos",
                    "allowSearch": false,
                    "alignContent": "right",
                    "allowHTML": false,
                    "highlightLinks": false,
                    "useMonospaceFont": false,
                    "preserveWhitespace": false
                  }
                ]
              },
              "invisibleColumns": [],
              "allowHTMLByDefault": false,
              "itemsPerPage": 25,
              "paginationSize": "default",
              "condensed": true,
              "withRowNumber": false
            }
          },
          "position": {
            "x": 0,
            "y": 3,
            "width": 6,
            "height": 13
          }
        }
      ],
      "pageType": "PAGE_TYPE_CANVAS"
    },
    {
      "name": "f40aeb4b",
      "displayName": "Cálculadora de costos",
      "layout": [
        {
          "widget": {
            "name": "4ec5320f",
            "multilineTextboxSpec": {
              "lines": [
                "# Cálculadora de costos\n",
                "\n",
                "Cálculadora de rentabilidad de retención de clientes"
              ]
            }
          },
          "position": {
            "x": 0,
            "y": 0,
            "width": 6,
            "height": 2
          }
        },
        {
          "widget": {
            "name": "costo_retencion",
            "queries": [
              {
                "name": "parameter_dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0ae8ea748111aa090ad8abf3be557_costo_retencion",
                "query": {
                  "datasetName": "b913f749",
                  "parameters": [
                    {
                      "name": "costo_retencion",
                      "keyword": "costo_retencion"
                    }
                  ],
                  "disaggregated": false
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "filter-single-select",
              "encodings": {
                "fields": [
                  {
                    "parameterName": "costo_retencion",
                    "queryName": "parameter_dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0ae8ea748111aa090ad8abf3be557_costo_retencion"
                  }
                ]
              },
              "frame": {
                "showTitle": true,
                "title": "Costo de retención",
                "showDescription": true,
                "description": "¿Cuánto te cuesta retener a un cliente?"
              }
            }
          },
          "position": {
            "x": 0,
            "y": 2,
            "width": 2,
            "height": 3
          }
        },
        {
          "widget": {
            "name": "costo_adquisicio",
            "queries": [
              {
                "name": "parameter_dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0ae8ea748111aa090ad8abf3be557_costo_adquisicion",
                "query": {
                  "datasetName": "b913f749",
                  "parameters": [
                    {
                      "name": "costo_adquisicion",
                      "keyword": "costo_adquisicion"
                    }
                  ],
                  "disaggregated": false
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "filter-single-select",
              "encodings": {
                "fields": [
                  {
                    "parameterName": "costo_adquisicion",
                    "queryName": "parameter_dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0ae8ea748111aa090ad8abf3be557_costo_adquisicion"
                  }
                ]
              },
              "frame": {
                "showTitle": true,
                "title": "Costo de adquisición",
                "showDescription": true,
                "description": "¿Cuánto te cuesta adquirir un cliente nuevo?"
              }
            }
          },
          "position": {
            "x": 2,
            "y": 2,
            "width": 2,
            "height": 3
          }
        },
        {
          "widget": {
            "name": "valor_cliente",
            "queries": [
              {
                "name": "parameter_dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0ae8ea748111aa090ad8abf3be557_valor_cliente_promedio",
                "query": {
                  "datasetName": "b913f749",
                  "parameters": [
                    {
                      "name": "valor_cliente_promedio",
                      "keyword": "valor_cliente_promedio"
                    }
                  ],
                  "disaggregated": false
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "filter-single-select",
              "encodings": {
                "fields": [
                  {
                    "parameterName": "valor_cliente_promedio",
                    "queryName": "parameter_dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0ae8ea748111aa090ad8abf3be557_valor_cliente_promedio"
                  }
                ]
              },
              "frame": {
                "showTitle": true,
                "title": "Valor del cliente promedio",
                "showDescription": true,
                "description": "¿Cuál es el valor de tu cliente promedio?"
              }
            }
          },
          "position": {
            "x": 4,
            "y": 2,
            "width": 2,
            "height": 3
          }
        },
        {
          "widget": {
            "name": "tasa_exito",
            "queries": [
              {
                "name": "parameter_dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0ae8ea748111aa090ad8abf3be557_tasa_exito_retencion",
                "query": {
                  "datasetName": "b913f749",
                  "parameters": [
                    {
                      "name": "tasa_exito_retencion",
                      "keyword": "tasa_exito_retencion"
                    }
                  ],
                  "disaggregated": false
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "filter-single-select",
              "encodings": {
                "fields": [
                  {
                    "parameterName": "tasa_exito_retencion",
                    "queryName": "parameter_dashboards/01f0a3ff56a81bd69d48a8d1c8cea9d5/datasets/01f0ae8ea748111aa090ad8abf3be557_tasa_exito_retencion"
                  }
                ]
              },
              "frame": {
                "showTitle": true,
                "title": "Tasa de exito de retención",
                "showDescription": true,
                "description": "Probabilidad de éxito esperada en una campaña de retención."
              }
            }
          },
          "position": {
            "x": 0,
            "y": 5,
            "width": 6,
            "height": 2
          }
        },
        {
          "widget": {
            "name": "f8758e84",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "b913f749",
                  "fields": [
                    {
                      "name": "clientes_en_riesgo",
                      "expression": "`clientes_en_riesgo`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "clientes_en_riesgo",
                  "format": {
                    "type": "number-plain",
                    "abbreviation": "none",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Clientes en riesgo de churn",
                "showDescription": true,
                "description": "Total de clientes cuya probabilidad de abandono supera el umbral actual"
              }
            }
          },
          "position": {
            "x": 0,
            "y": 9,
            "width": 2,
            "height": 3
          }
        },
        {
          "widget": {
            "name": "43c83279",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "b913f749",
                  "fields": [
                    {
                      "name": "costo_total_retencion",
                      "expression": "`costo_total_retencion`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "costo_total_retencion",
                  "style": {
                    "color": {
                      "themeColorType": "visualizationColors",
                      "position": 4
                    }
                  },
                  "format": {
                    "type": "number-currency",
                    "currencyCode": "GTQ",
                    "abbreviation": "none",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Costo total estimado de retención",
                "showDescription": true,
                "description": "Inversión necesaria para aplicar estrategias de retención a todos los clientes en riesgo, "
              }
            }
          },
          "position": {
            "x": 2,
            "y": 9,
            "width": 2,
            "height": 3
          }
        },
        {
          "widget": {
            "name": "444dd499",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "b913f749",
                  "fields": [
                    {
                      "name": "clientes_retenidos_esperados",
                      "expression": "`clientes_retenidos_esperados`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "clientes_retenidos_esperados",
                  "format": {
                    "type": "number-plain",
                    "abbreviation": "none",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Clientes retenidos esperados",
                "showDescription": true,
                "description": "Número estimado de clientes en riesgo que podrían conservarse"
              }
            }
          },
          "position": {
            "x": 4,
            "y": 9,
            "width": 2,
            "height": 3
          }
        },
        {
          "widget": {
            "name": "87c4d322",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "b913f749",
                  "fields": [
                    {
                      "name": "valor_conservado",
                      "expression": "`valor_conservado`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "valor_conservado",
                  "format": {
                    "type": "number-currency",
                    "currencyCode": "GTQ",
                    "abbreviation": "none",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  },
                  "style": {
                    "color": {
                      "themeColorType": "visualizationColors",
                      "position": 3
                    }
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Valor conservado por retención",
                "showDescription": true,
                "description": "Monto total que la empresa evitaría perder al retener clientes en riesgo"
              }
            }
          },
          "position": {
            "x": 0,
            "y": 12,
            "width": 6,
            "height": 4
          }
        },
        {
          "widget": {
            "name": "b4876dbd",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "b913f749",
                  "fields": [
                    {
                      "name": "roi_estimado",
                      "expression": "`roi_estimado`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "roi_estimado",
                  "format": {
                    "type": "number-percent",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "ROI estimado de la campaña de retención",
                "showDescription": true,
                "description": "retorno calculado al comparar el valor conservado frente al costo total de retención. Positivo indica beneficio neto."
              }
            }
          },
          "position": {
            "x": 0,
            "y": 22,
            "width": 6,
            "height": 4
          }
        },
        {
          "widget": {
            "name": "0f64e47f",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "b913f749",
                  "fields": [
                    {
                      "name": "perdida_sin_accion",
                      "expression": "`perdida_sin_accion`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "perdida_sin_accion",
                  "style": {
                    "color": {
                      "themeColorType": "visualizationColors",
                      "position": 4
                    },
                    "rules": [
                      {
                        "condition": {
                          "operator": ">="
                        },
                        "color": {
                          "themeColorType": "visualizationColors",
                          "position": 4
                        }
                      }
                    ]
                  },
                  "format": {
                    "type": "number-currency",
                    "currencyCode": "GTQ",
                    "abbreviation": "none",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Pérdida esperada sin acción",
                "showDescription": true,
                "description": "Valor potencial perdido si no se ejecuta ninguna acción de retención sobre los clientes en riesgo al umbral actual."
              }
            }
          },
          "position": {
            "x": 0,
            "y": 16,
            "width": 6,
            "height": 3
          }
        },
        {
          "widget": {
            "name": "109f375e",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "b913f749",
                  "fields": [
                    {
                      "name": "costo_reemplazo",
                      "expression": "`costo_reemplazo`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "costo_reemplazo",
                  "style": {
                    "color": {
                      "themeColorType": "visualizationColors",
                      "position": 4
                    }
                  },
                  "format": {
                    "type": "number-currency",
                    "currencyCode": "GTQ",
                    "abbreviation": "none",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Costo de reemplazo",
                "showDescription": true,
                "description": "Inversión necesaria para reemplazar con nuevos clientes a los que se perderían"
              }
            }
          },
          "position": {
            "x": 0,
            "y": 19,
            "width": 6,
            "height": 3
          }
        },
        {
          "widget": {
            "name": "fd68fda3",
            "multilineTextboxSpec": {
              "lines": [
                "# <span style=\"text-align:center;display:block;\">KPI's</span>"
              ]
            }
          },
          "position": {
            "x": 0,
            "y": 7,
            "width": 6,
            "height": 2
          }
        }
      ],
      "pageType": "PAGE_TYPE_CANVAS"
    },
    {
      "name": "c2c41790",
      "displayName": "Rendimiento del modelo",
      "layout": [
        {
          "widget": {
            "name": "37cead48",
            "multilineTextboxSpec": {
              "lines": [
                "# RENDIMIENTO DEL MODELO EN EL PERIODO PASADO \n",
                "\n",
                "Cambia el umbral de decisión para ver como cambian las metricas"
              ]
            }
          },
          "position": {
            "x": 0,
            "y": 0,
            "width": 6,
            "height": 2
          }
        },
        {
          "widget": {
            "name": "1c549276",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "27cdf85d",
                  "fields": [
                    {
                      "name": "accuracy",
                      "expression": "`accuracy`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "accuracy",
                  "format": {
                    "type": "number-percent",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  },
                  "style": {
                    "rules": [
                      {
                        "condition": {
                          "operator": ">=",
                          "operand": {
                            "type": "data-value",
                            "value": "0.8"
                          }
                        },
                        "color": "#00A972"
                      },
                      {
                        "condition": {
                          "operator": ">=",
                          "operand": {
                            "type": "data-value",
                            "value": "0.6"
                          }
                        },
                        "color": {
                          "themeColorType": "visualizationColors",
                          "position": 2
                        }
                      },
                      {
                        "condition": {
                          "operator": "<",
                          "operand": {
                            "type": "data-value",
                            "value": "0.6"
                          }
                        },
                        "color": {
                          "themeColorType": "visualizationColors",
                          "position": 4
                        }
                      }
                    ]
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Accuracy",
                "showDescription": true,
                "description": "Porcentaje total de predicciones correctas del modelo, considerando tanto clientes retenidos como los que hacen churn."
              }
            }
          },
          "position": {
            "x": 0,
            "y": 2,
            "width": 6,
            "height": 2
          }
        },
        {
          "widget": {
            "name": "3a0ee920",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "27cdf85d",
                  "fields": [
                    {
                      "name": "precision",
                      "expression": "`precision`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "precision",
                  "format": {
                    "type": "number-percent",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  },
                  "style": {
                    "rules": [
                      {
                        "condition": {
                          "operator": ">=",
                          "operand": {
                            "type": "data-value",
                            "value": "0.8"
                          }
                        },
                        "color": "#00A972"
                      },
                      {
                        "condition": {
                          "operator": ">=",
                          "operand": {
                            "type": "data-value",
                            "value": "0.6"
                          }
                        },
                        "color": {
                          "themeColorType": "visualizationColors",
                          "position": 2
                        }
                      },
                      {
                        "condition": {
                          "operator": "<",
                          "operand": {
                            "type": "data-value",
                            "value": "0.6"
                          }
                        },
                        "color": {
                          "themeColorType": "visualizationColors",
                          "position": 4
                        }
                      }
                    ]
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Precisison",
                "showDescription": true,
                "description": "De los clientes que el modelo marcó como en riesgo, indica qué proporción realmente hizo churn."
              }
            }
          },
          "position": {
            "x": 0,
            "y": 6,
            "width": 6,
            "height": 2
          }
        },
        {
          "widget": {
            "name": "277a7baf",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "27cdf85d",
                  "fields": [
                    {
                      "name": "recall",
                      "expression": "`recall`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "recall",
                  "format": {
                    "type": "number-percent",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  },
                  "style": {
                    "rules": [
                      {
                        "condition": {
                          "operator": ">=",
                          "operand": {
                            "type": "data-value",
                            "value": "0.8"
                          }
                        },
                        "color": "#00A972"
                      },
                      {
                        "condition": {
                          "operator": ">=",
                          "operand": {
                            "type": "data-value",
                            "value": "0.6"
                          }
                        },
                        "color": {
                          "themeColorType": "visualizationColors",
                          "position": 2
                        }
                      },
                      {
                        "condition": {
                          "operator": "<",
                          "operand": {
                            "type": "data-value",
                            "value": "0.6"
                          }
                        },
                        "color": {
                          "themeColorType": "visualizationColors",
                          "position": 4
                        }
                      }
                    ]
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Recall",
                "showDescription": true,
                "description": "De todos los clientes que realmente hicieron churn, mide qué proporción fue detectada correctamente por el modelo."
              }
            }
          },
          "position": {
            "x": 0,
            "y": 4,
            "width": 6,
            "height": 2
          }
        },
        {
          "widget": {
            "name": "490420b6",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "27cdf85d",
                  "fields": [
                    {
                      "name": "f1_score",
                      "expression": "`f1_score`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "f1_score",
                  "format": {
                    "type": "number-percent",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  },
                  "style": {
                    "rules": [
                      {
                        "condition": {
                          "operator": ">=",
                          "operand": {
                            "type": "data-value",
                            "value": "0.8"
                          }
                        },
                        "color": "#00A972"
                      },
                      {
                        "condition": {
                          "operator": ">=",
                          "operand": {
                            "type": "data-value",
                            "value": "0.6"
                          }
                        },
                        "color": {
                          "themeColorType": "visualizationColors",
                          "position": 2
                        }
                      },
                      {
                        "condition": {
                          "operator": "<",
                          "operand": {
                            "type": "data-value",
                            "value": "0.6"
                          }
                        },
                        "color": {
                          "themeColorType": "visualizationColors",
                          "position": 4
                        }
                      }
                    ]
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "f1",
                "showDescription": true,
                "description": "Media armónica entre precision y recall; resume el equilibrio entre aciertos y omisiones en la detección de churn."
              }
            }
          },
          "position": {
            "x": 0,
            "y": 8,
            "width": 6,
            "height": 2
          }
        },
        {
          "widget": {
            "name": "41c0b0a4",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "27cdf85d",
                  "fields": [
                    {
                      "name": "total_registros",
                      "expression": "`total_registros`"
                    },
                    {
                      "name": "verdaderos_positivos",
                      "expression": "`verdaderos_positivos`"
                    },
                    {
                      "name": "verdaderos_negativos",
                      "expression": "`verdaderos_negativos`"
                    },
                    {
                      "name": "falsos_positivos",
                      "expression": "`falsos_positivos`"
                    },
                    {
                      "name": "falsos_negativos",
                      "expression": "`falsos_negativos`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 1,
              "widgetType": "table",
              "encodings": {
                "columns": [
                  {
                    "fieldName": "total_registros",
                    "numberFormat": "0",
                    "booleanValues": [
                      "false",
                      "true"
                    ],
                    "imageUrlTemplate": "{{ @ }}",
                    "imageTitleTemplate": "{{ @ }}",
                    "imageWidth": "",
                    "imageHeight": "",
                    "linkUrlTemplate": "{{ @ }}",
                    "linkTextTemplate": "{{ @ }}",
                    "linkTitleTemplate": "{{ @ }}",
                    "linkOpenInNewTab": true,
                    "type": "integer",
                    "displayAs": "number",
                    "visible": true,
                    "order": 100000,
                    "title": "total_registros",
                    "allowSearch": false,
                    "alignContent": "right",
                    "allowHTML": false,
                    "highlightLinks": false,
                    "useMonospaceFont": false,
                    "preserveWhitespace": false
                  },
                  {
                    "fieldName": "verdaderos_positivos",
                    "numberFormat": "0",
                    "booleanValues": [
                      "false",
                      "true"
                    ],
                    "imageUrlTemplate": "{{ @ }}",
                    "imageTitleTemplate": "{{ @ }}",
                    "imageWidth": "",
                    "imageHeight": "",
                    "linkUrlTemplate": "{{ @ }}",
                    "linkTextTemplate": "{{ @ }}",
                    "linkTitleTemplate": "{{ @ }}",
                    "linkOpenInNewTab": true,
                    "type": "integer",
                    "displayAs": "number",
                    "visible": true,
                    "order": 100001,
                    "title": "verdaderos_positivos",
                    "allowSearch": false,
                    "alignContent": "right",
                    "allowHTML": false,
                    "highlightLinks": false,
                    "useMonospaceFont": false,
                    "preserveWhitespace": false
                  },
                  {
                    "fieldName": "verdaderos_negativos",
                    "numberFormat": "0",
                    "booleanValues": [
                      "false",
                      "true"
                    ],
                    "imageUrlTemplate": "{{ @ }}",
                    "imageTitleTemplate": "{{ @ }}",
                    "imageWidth": "",
                    "imageHeight": "",
                    "linkUrlTemplate": "{{ @ }}",
                    "linkTextTemplate": "{{ @ }}",
                    "linkTitleTemplate": "{{ @ }}",
                    "linkOpenInNewTab": true,
                    "type": "integer",
                    "displayAs": "number",
                    "visible": true,
                    "order": 100002,
                    "title": "verdaderos_negativos",
                    "allowSearch": false,
                    "alignContent": "right",
                    "allowHTML": false,
                    "highlightLinks": false,
                    "useMonospaceFont": false,
                    "preserveWhitespace": false
                  },
                  {
                    "fieldName": "falsos_positivos",
                    "numberFormat": "0",
                    "booleanValues": [
                      "false",
                      "true"
                    ],
                    "imageUrlTemplate": "{{ @ }}",
                    "imageTitleTemplate": "{{ @ }}",
                    "imageWidth": "",
                    "imageHeight": "",
                    "linkUrlTemplate": "{{ @ }}",
                    "linkTextTemplate": "{{ @ }}",
                    "linkTitleTemplate": "{{ @ }}",
                    "linkOpenInNewTab": true,
                    "type": "integer",
                    "displayAs": "number",
                    "visible": true,
                    "order": 100003,
                    "title": "falsos_positivos",
                    "allowSearch": false,
                    "alignContent": "right",
                    "allowHTML": false,
                    "highlightLinks": false,
                    "useMonospaceFont": false,
                    "preserveWhitespace": false
                  },
                  {
                    "fieldName": "falsos_negativos",
                    "numberFormat": "0",
                    "booleanValues": [
                      "false",
                      "true"
                    ],
                    "imageUrlTemplate": "{{ @ }}",
                    "imageTitleTemplate": "{{ @ }}",
                    "imageWidth": "",
                    "imageHeight": "",
                    "linkUrlTemplate": "{{ @ }}",
                    "linkTextTemplate": "{{ @ }}",
                    "linkTitleTemplate": "{{ @ }}",
                    "linkOpenInNewTab": true,
                    "type": "integer",
                    "displayAs": "number",
                    "visible": true,
                    "order": 100004,
                    "title": "falsos_negativos",
                    "allowSearch": false,
                    "alignContent": "right",
                    "allowHTML": false,
                    "highlightLinks": false,
                    "useMonospaceFont": false,
                    "preserveWhitespace": false
                  }
                ]
              },
              "invisibleColumns": [
                {
                  "booleanValues": [
                    "false",
                    "true"
                  ],
                  "imageUrlTemplate": "{{ @ }}",
                  "imageTitleTemplate": "{{ @ }}",
                  "imageWidth": "",
                  "imageHeight": "",
                  "linkUrlTemplate": "{{ @ }}",
                  "linkTextTemplate": "{{ @ }}",
                  "linkTitleTemplate": "{{ @ }}",
                  "linkOpenInNewTab": true,
                  "name": "accuracy",
                  "type": "decimal",
                  "displayAs": "number",
                  "order": 100005,
                  "title": "accuracy",
                  "allowSearch": false,
                  "alignContent": "right",
                  "allowHTML": false,
                  "highlightLinks": false,
                  "useMonospaceFont": false,
                  "preserveWhitespace": false
                },
                {
                  "booleanValues": [
                    "false",
                    "true"
                  ],
                  "imageUrlTemplate": "{{ @ }}",
                  "imageTitleTemplate": "{{ @ }}",
                  "imageWidth": "",
                  "imageHeight": "",
                  "linkUrlTemplate": "{{ @ }}",
                  "linkTextTemplate": "{{ @ }}",
                  "linkTitleTemplate": "{{ @ }}",
                  "linkOpenInNewTab": true,
                  "name": "precision",
                  "type": "decimal",
                  "displayAs": "number",
                  "order": 100006,
                  "title": "precision",
                  "allowSearch": false,
                  "alignContent": "right",
                  "allowHTML": false,
                  "highlightLinks": false,
                  "useMonospaceFont": false,
                  "preserveWhitespace": false
                },
                {
                  "booleanValues": [
                    "false",
                    "true"
                  ],
                  "imageUrlTemplate": "{{ @ }}",
                  "imageTitleTemplate": "{{ @ }}",
                  "imageWidth": "",
                  "imageHeight": "",
                  "linkUrlTemplate": "{{ @ }}",
                  "linkTextTemplate": "{{ @ }}",
                  "linkTitleTemplate": "{{ @ }}",
                  "linkOpenInNewTab": true,
                  "name": "recall",
                  "type": "decimal",
                  "displayAs": "number",
                  "order": 100007,
                  "title": "recall",
                  "allowSearch": false,
                  "alignContent": "right",
                  "allowHTML": false,
                  "highlightLinks": false,
                  "useMonospaceFont": false,
                  "preserveWhitespace": false
                },
                {
                  "booleanValues": [
                    "false",
                    "true"
                  ],
                  "imageUrlTemplate": "{{ @ }}",
                  "imageTitleTemplate": "{{ @ }}",
                  "imageWidth": "",
                  "imageHeight": "",
                  "linkUrlTemplate": "{{ @ }}",
                  "linkTextTemplate": "{{ @ }}",
                  "linkTitleTemplate": "{{ @ }}",
                  "linkOpenInNewTab": true,
                  "name": "f1_score",
                  "type": "decimal",
                  "displayAs": "number",
                  "order": 100008,
                  "title": "f1_score",
                  "allowSearch": false,
                  "alignContent": "right",
                  "allowHTML": false,
                  "highlightLinks": false,
                  "useMonospaceFont": false,
                  "preserveWhitespace": false
                }
              ],
              "allowHTMLByDefault": false,
              "itemsPerPage": 25,
              "paginationSize": "default",
              "condensed": true,
              "withRowNumber": false
            }
          },
          "position": {
            "x": 0,
            "y": 10,
            "width": 6,
            "height": 3
          }
        },
        {
          "widget": {
            "name": "24761cd4",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "e026c21f",
                  "fields": [
                    {
                      "name": "valor_real",
                      "expression": "`valor_real`"
                    },
                    {
                      "name": "valor_predicho",
                      "expression": "`valor_predicho`"
                    },
                    {
                      "name": "cantidad",
                      "expression": "`cantidad`"
                    }
                  ],
                  "cubeGroupingSets": {
                    "sets": [
                      {
                        "fieldNames": [
                          "valor_real"
                        ]
                      },
                      {
                        "fieldNames": [
                          "valor_predicho"
                        ]
                      }
                    ]
                  },
                  "disaggregated": true,
                  "orders": [
                    {
                      "direction": "ASC",
                      "expression": "`valor_real`"
                    },
                    {
                      "direction": "ASC",
                      "expression": "`valor_predicho`"
                    }
                  ]
                }
              }
            ],
            "spec": {
              "version": 3,
              "widgetType": "pivot",
              "encodings": {
                "rows": [
                  {
                    "fieldName": "valor_real",
                    "headerWidth": 150
                  }
                ],
                "columns": [
                  {
                    "fieldName": "valor_predicho"
                  }
                ],
                "cell": {
                  "type": "multi-cell",
                  "fields": [
                    {
                      "fieldName": "cantidad",
                      "cellType": "text",
                      "format": {
                        "type": "number-plain",
                        "abbreviation": "none",
                        "decimalPlaces": {
                          "type": "exact",
                          "places": 0
                        },
                        "hideGroupSeparator": true
                      }
                    }
                  ],
                  "width": 150
                }
              }
            }
          },
          "position": {
            "x": 0,
            "y": 13,
            "width": 6,
            "height": 4
          }
        }
      ],
      "pageType": "PAGE_TYPE_CANVAS"
    },
    {
      "name": "31d0398c",
      "displayName": "Periodo pasado vs este",
      "layout": [
        {
          "widget": {
            "name": "089ec3cf",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "92ad8ba4",
                  "fields": [
                    {
                      "name": "period",
                      "expression": "`period`"
                    },
                    {
                      "name": "sum(churn_promedio_pct)",
                      "expression": "SUM(`churn_promedio_pct`)"
                    }
                  ],
                  "disaggregated": false
                }
              }
            ],
            "spec": {
              "version": 3,
              "widgetType": "bar",
              "encodings": {
                "x": {
                  "fieldName": "period",
                  "scale": {
                    "type": "categorical"
                  }
                },
                "y": {
                  "fieldName": "sum(churn_promedio_pct)",
                  "scale": {
                    "type": "quantitative"
                  },
                  "format": {
                    "type": "number-percent",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  },
                  "displayName": "Porcentaje de Churn esperado"
                },
                "label": {
                  "show": true
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Promedio de probabilidad de churn (%)",
                "showDescription": true,
                "description": "“El riesgo promedio de churn bajó entre 2024 y 2025, reflejando el impacto de las estrategias de retención.”"
              }
            }
          },
          "position": {
            "x": 0,
            "y": 2,
            "width": 3,
            "height": 8
          }
        },
        {
          "widget": {
            "name": "5a75a8c9",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "fbaf2785",
                  "fields": [
                    {
                      "name": "total_clientes_2024",
                      "expression": "`total_clientes_2024`"
                    },
                    {
                      "name": "clientes_en_riesgo_2024",
                      "expression": "`clientes_en_riesgo_2024`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "clientes_en_riesgo_2024",
                  "format": {
                    "type": "number-plain",
                    "abbreviation": "none",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  },
                  "style": {
                    "color": {
                      "themeColorType": "visualizationColors",
                      "position": 4
                    }
                  }
                },
                "target": {
                  "fieldName": "total_clientes_2024",
                  "format": {
                    "type": "number-plain",
                    "abbreviation": "none",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Clientes en riesgo 2024"
              }
            }
          },
          "position": {
            "x": 3,
            "y": 6,
            "width": 3,
            "height": 4
          }
        },
        {
          "widget": {
            "name": "0c7f63c6",
            "queries": [
              {
                "name": "main_query",
                "query": {
                  "datasetName": "fbaf2785",
                  "fields": [
                    {
                      "name": "total_clientes_2025",
                      "expression": "`total_clientes_2025`"
                    },
                    {
                      "name": "clientes_en_riesgo_2025",
                      "expression": "`clientes_en_riesgo_2025`"
                    }
                  ],
                  "disaggregated": true
                }
              }
            ],
            "spec": {
              "version": 2,
              "widgetType": "counter",
              "encodings": {
                "value": {
                  "fieldName": "clientes_en_riesgo_2025",
                  "style": {
                    "color": {
                      "themeColorType": "visualizationColors",
                      "position": 3
                    }
                  },
                  "format": {
                    "type": "number-plain",
                    "abbreviation": "none",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  }
                },
                "target": {
                  "fieldName": "total_clientes_2025",
                  "format": {
                    "type": "number-plain",
                    "abbreviation": "none",
                    "decimalPlaces": {
                      "type": "max",
                      "places": 2
                    }
                  }
                }
              },
              "frame": {
                "showTitle": true,
                "title": "Clientes en riesgo 2025"
              }
            }
          },
          "position": {
            "x": 3,
            "y": 2,
            "width": 3,
            "height": 4
          }
        },
        {
          "widget": {
            "name": "c4e9b643",
            "multilineTextboxSpec": {
              "lines": [
                "# Evolución del riesgo de churn entre periodos"
              ]
            }
          },
          "position": {
            "x": 0,
            "y": 0,
            "width": 6,
            "height": 2
          }
        }
      ],
      "pageType": "PAGE_TYPE_CANVAS"
    }
  ],
  "uiSettings": {
    "theme": {
      "widgetHeaderAlignment": "ALIGNMENT_UNSPECIFIED"
    },
    "genieSpace": {
      "isEnabled": false
    }
  }
}
