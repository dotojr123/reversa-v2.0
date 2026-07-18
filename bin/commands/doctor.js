import { HealthManager } from '../../lib/core/health/HealthManager.js';

export async function runDoctorCommand() {
    console.log("Running Reversa KIP System Diagnostics...\n");
    
    // Na prática, injetaríamos os singletons do contexto aqui
    const healthManager = new HealthManager(
        { plugins: new Map() }, // mock lifecycle
        {}, // mock storage
        {}  // mock queue
    );

    const report = await healthManager.checkAll();
    
    console.log(`System Status: [${report.status}]`);
    console.log("--------------------------------------------------");
    
    for (const [comp, data] of Object.entries(report.components)) {
        const latencyStr = data.latency ? `(${data.latency})` : '';
        const icon = data.status === 'OK' ? '✓' : data.status === 'WARNING' ? '⚠' : '×';
        console.log(`${icon} ${comp.padEnd(20)} [${data.status}] ${latencyStr}`);
        if (data.details || data.error) {
            console.log(`   └─ ${data.details || data.error}`);
        }
    }
    console.log("--------------------------------------------------");
}
